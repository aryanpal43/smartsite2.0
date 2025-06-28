const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const videoStorage = require('../services/videoStorage');
const aiAnalysis = require('../services/aiAnalysis');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_VIDEO_SIZE) || 100 * 1024 * 1024, // 100MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

// Upload video from ESP32-CAM
router.post('/upload', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    const { sessionId, helmetId } = req.body;

    if (!sessionId || !helmetId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Helmet ID are required'
      });
    }

    // Verify session exists and is active
    const sessionResult = await db.query(
      'SELECT * FROM sessions WHERE id = $1 AND helmet_id = $2 AND status = $3',
      [sessionId, helmetId, 'active']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Active session not found'
      });
    }

    const session = sessionResult.rows[0];

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `session_${sessionId}_${timestamp}.mp4`;

    // Store video locally
    const localStorageResult = await videoStorage.storeLocally(
      req.file.buffer,
      filename,
      sessionId
    );

    // Get video duration
    const duration = await videoStorage.getVideoDuration(localStorageResult.localPath);

    // Generate cloud key
    const cloudKey = videoStorage.generateCloudKey(sessionId, filename);

    // Save video record to database
    const videoResult = await db.query(
      `INSERT INTO videos (session_id, filename, file_path, file_size, duration, local_path, upload_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        sessionId,
        filename,
        cloudKey,
        localStorageResult.fileSize,
        duration,
        localStorageResult.localPath,
        'pending'
      ]
    );

    const videoId = videoResult.rows[0].id;

    // Upload to cloud storage (async)
    videoStorage.uploadToCloud(localStorageResult.localPath, cloudKey)
      .then(async (cloudResult) => {
        if (cloudResult.localOnly) {
          // Update database for local-only storage
          await db.query(
            'UPDATE videos SET upload_status = $1 WHERE id = $2',
            ['completed', videoId]
          );
          logger.info(`Video ${videoId} stored locally only`);
        } else {
          // Update database with cloud URL
          await db.query(
            'UPDATE videos SET cloud_url = $1, upload_status = $2 WHERE id = $3',
            [cloudResult.cloudUrl, 'completed', videoId]
          );
          logger.info(`Video ${videoId} uploaded to ${cloudResult.provider} successfully`);
        }

        // Trigger AI analysis (async)
        aiAnalysis.analyzeVideo(localStorageResult.localPath, sessionId)
          .then(async (analysisResult) => {
            await db.query(
              `INSERT INTO ai_analysis (video_id, session_id, analysis_data, work_quality, 
               activity_detected, idle_time, active_time, confidence_score)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                videoId,
                sessionId,
                JSON.stringify(analysisResult.analysisData),
                analysisResult.workQuality,
                analysisResult.activityDetected,
                analysisResult.idleTime,
                analysisResult.activeTime,
                analysisResult.confidenceScore
              ]
            );
            logger.info(`AI analysis completed for video ${videoId}`);
          })
          .catch(error => {
            logger.error(`AI analysis failed for video ${videoId}:`, error);
          });
      })
      .catch(error => {
        logger.error(`Cloud upload failed for video ${videoId}:`, error);
        // Update database with failed status
        db.query(
          'UPDATE videos SET upload_status = $1 WHERE id = $2',
          ['failed', videoId]
        );
      });

    logger.info(`Video uploaded successfully: ${filename}`);

    res.status(201).json({
      success: true,
      data: {
        videoId,
        filename,
        fileSize: localStorageResult.fileSize,
        duration,
        uploadStatus: 'pending',
        storageProvider: videoStorage.getStorageInfo().provider
      }
    });
  } catch (error) {
    logger.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get videos by session
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT v.*, 
              a.work_quality, a.activity_detected, a.idle_time, a.active_time, a.confidence_score
       FROM videos v
       LEFT JOIN ai_analysis a ON v.id = a.video_id
       WHERE v.session_id = $1
       ORDER BY v.created_at DESC
       LIMIT $2 OFFSET $3`,
      [sessionId, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM videos WHERE session_id = $1',
      [sessionId]
    );

    const totalVideos = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalVideos / limit);

    res.json({
      success: true,
      data: {
        videos: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get video by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT v.*, 
              a.work_quality, a.activity_detected, a.idle_time, a.active_time, 
              a.confidence_score, a.analysis_data
       FROM videos v
       LEFT JOIN ai_analysis a ON v.id = a.video_id
       WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const video = result.rows[0];

    res.json({
      success: true,
      data: {
        video
      }
    });
  } catch (error) {
    logger.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Stream video
router.get('/:id/stream', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM videos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const video = result.rows[0];

    if (fs.existsSync(video.local_path)) {
      const stat = fs.statSync(video.local_path);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(video.local_path, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(video.local_path).pipe(res);
      }
    } else {
      res.status(404).json({
        success: false,
        error: 'Video file not found'
      });
    }
  } catch (error) {
    logger.error('Video stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get storage info
router.get('/storage/info', protect, async (req, res) => {
  try {
    const storageInfo = videoStorage.getStorageInfo();
    
    res.json({
      success: true,
      data: {
        storageInfo
      }
    });
  } catch (error) {
    logger.error('Get storage info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 
 