const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const logger = require('../utils/logger');

class VideoStorageService {
  constructor() {
    this.localPath = process.env.STORAGE_PATH || './uploads/videos';
    this.retentionDays = parseInt(process.env.VIDEO_RETENTION_DAYS) || 30;
    
    // Create local directory if it doesn't exist
    if (!fs.existsSync(this.localPath)) {
      fs.mkdirSync(this.localPath, { recursive: true });
    }
  }

  // Store video locally
  async storeLocally(videoBuffer, filename, sessionId) {
    try {
      const sessionPath = path.join(this.localPath, sessionId.toString());
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
      }

      const filePath = path.join(sessionPath, filename);
      fs.writeFileSync(filePath, videoBuffer);

      const stats = fs.statSync(filePath);
      
      logger.info(`Video stored locally: ${filePath}, Size: ${stats.size} bytes`);
      
      return {
        localPath: filePath,
        fileSize: stats.size,
        filename: filename,
        storageProvider: 'local'
      };
    } catch (error) {
      logger.error('Error storing video locally:', error);
      throw error;
    }
  }

  // Compress video
  async compressVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-crf 28',
          '-preset fast',
          '-c:a aac',
          '-b:a 128k'
        ])
        .output(outputPath)
        .on('end', () => {
          logger.info(`Video compressed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Error compressing video:', err);
          reject(err);
        })
        .run();
    });
  }

  // Get video duration
  async getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  // Delete local file
  async deleteLocalFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Local file deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting local file:', error);
      throw error;
    }
  }

  // Cleanup old videos
  async cleanupOldVideos() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const files = await this.getAllVideoFiles();
      let deletedCount = 0;

      for (const file of files) {
        const stats = fs.statSync(file);
        if (stats.mtime < cutoffDate) {
          await this.deleteLocalFile(file);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old video files`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old videos:', error);
      throw error;
    }
  }

  // Get all video files recursively
  async getAllVideoFiles() {
    const videoFiles = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (this.isVideoFile(item)) {
          videoFiles.push(fullPath);
        }
      }
    };

    scanDirectory(this.localPath);
    return videoFiles;
  }

  // Check if file is a video
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  // Get video stream for playback
  async getVideoStream(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('Video file not found');
      }

      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
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
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      logger.error('Error streaming video:', error);
      throw error;
    }
  }

  // Get storage information
  getStorageInfo() {
    try {
      const stats = fs.statSync(this.localPath);
      const totalSize = this.calculateDirectorySize(this.localPath);
      
      return {
        provider: 'local',
        path: this.localPath,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        retentionDays: this.retentionDays,
        lastModified: stats.mtime
      };
    } catch (error) {
      logger.error('Error getting storage info:', error);
      return {
        provider: 'local',
        path: this.localPath,
        error: 'Unable to get storage information'
      };
    }
  }

  // Calculate directory size recursively
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    if (!fs.existsSync(dirPath)) return 0;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        totalSize += this.calculateDirectorySize(fullPath);
      } else {
        totalSize += stat.size;
      }
    }
    
    return totalSize;
  }

  // Generate unique filename
  generateFilename(sessionId, originalName) {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${sessionId}_${baseName}_${timestamp}${ext}`;
  }
}

module.exports = new VideoStorageService(); 