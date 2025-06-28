const express = require('express');
const { protect: auth } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get dashboard overview data
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get total projects
    const projectsResult = await db.query(
      'SELECT COUNT(*) as total_projects, COUNT(CASE WHEN status = $1 THEN 1 END) as active_projects FROM projects',
      ['active']
    );

    // Get total workers
    const workersResult = await db.query(
      'SELECT COUNT(*) as total_workers, COUNT(CASE WHEN helmet_id IS NOT NULL THEN 1 END) as assigned_workers FROM workers'
    );

    // Get total helmets
    const helmetsResult = await db.query(
      'SELECT COUNT(*) as total_helmets, COUNT(CASE WHEN status = $1 THEN 1 END) as available_helmets FROM helmets',
      ['available']
    );

    // Get today's sessions
    const today = new Date().toISOString().split('T')[0];
    const sessionsResult = await db.query(
      'SELECT COUNT(*) as today_sessions FROM sessions WHERE DATE(created_at) = $1',
      [today]
    );

    // Get recent video uploads
    const videosResult = await db.query(
      'SELECT COUNT(*) as total_videos, COUNT(CASE WHEN DATE(created_at) = $1 THEN 1 END) as today_videos FROM videos',
      [today]
    );

    const dashboardData = {
      metrics: {
        totalProjects: parseInt(projectsResult.rows[0]?.total_projects || 0),
        activeProjects: parseInt(projectsResult.rows[0]?.active_projects || 0),
        totalWorkers: parseInt(workersResult.rows[0]?.total_workers || 0),
        assignedWorkers: parseInt(workersResult.rows[0]?.assigned_workers || 0),
        totalHelmets: parseInt(helmetsResult.rows[0]?.total_helmets || 0),
        availableHelmets: parseInt(helmetsResult.rows[0]?.available_helmets || 0),
        todaySessions: parseInt(sessionsResult.rows[0]?.today_sessions || 0),
        totalVideos: parseInt(videosResult.rows[0]?.total_videos || 0),
        todayVideos: parseInt(videosResult.rows[0]?.today_videos || 0)
      }
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get helmet status chart data
router.get('/helmet-status', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(CASE WHEN battery_level > 80 THEN 1 END) as high_battery,
        COUNT(CASE WHEN battery_level BETWEEN 50 AND 80 THEN 1 END) as medium_battery,
        COUNT(CASE WHEN battery_level < 50 THEN 1 END) as low_battery
      FROM helmets 
      GROUP BY status
    `);

    const helmetStatusData = {
      byStatus: result.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      })),
      byBattery: {
        high: parseInt(result.rows.reduce((sum, row) => sum + parseInt(row.high_battery || 0), 0)),
        medium: parseInt(result.rows.reduce((sum, row) => sum + parseInt(row.medium_battery || 0), 0)),
        low: parseInt(result.rows.reduce((sum, row) => sum + parseInt(row.low_battery || 0), 0))
      }
    };

    res.json(helmetStatusData);
  } catch (error) {
    logger.error('Error fetching helmet status data:', error);
    res.status(500).json({ error: 'Failed to fetch helmet status data' });
  }
});

// Get project performance data
router.get('/project-performance', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.status,
        p.progress,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT v.id) as total_videos,
        AVG(s.duration) as avg_session_duration
      FROM projects p
      LEFT JOIN sessions s ON p.id = s.project_id
      LEFT JOIN videos v ON s.id = v.session_id
      GROUP BY p.id, p.name, p.status, p.progress
      ORDER BY p.created_at DESC
    `);

    const projectPerformanceData = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      progress: parseFloat(row.progress || 0),
      totalSessions: parseInt(row.total_sessions || 0),
      totalVideos: parseInt(row.total_videos || 0),
      avgSessionDuration: parseFloat(row.avg_session_duration || 0)
    }));

    res.json(projectPerformanceData);
  } catch (error) {
    logger.error('Error fetching project performance data:', error);
    res.status(500).json({ error: 'Failed to fetch project performance data' });
  }
});

// Get worker efficiency data
router.get('/worker-efficiency', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        w.id,
        w.name,
        w.role,
        w.department,
        COUNT(s.id) as total_sessions,
        AVG(s.duration) as avg_session_duration,
        COUNT(v.id) as total_videos,
        h.status as helmet_status,
        h.battery_level
      FROM workers w
      LEFT JOIN sessions s ON w.id = s.worker_id
      LEFT JOIN videos v ON s.id = v.session_id
      LEFT JOIN helmets h ON w.helmet_id = h.id
      GROUP BY w.id, w.name, w.role, w.department, h.status, h.battery_level
      ORDER BY total_sessions DESC
    `);

    const workerEfficiencyData = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      totalSessions: parseInt(row.total_sessions || 0),
      avgSessionDuration: parseFloat(row.avg_session_duration || 0),
      totalVideos: parseInt(row.total_videos || 0),
      helmetStatus: row.helmet_status || 'None',
      batteryLevel: parseInt(row.battery_level || 0)
    }));

    res.json(workerEfficiencyData);
  } catch (error) {
    logger.error('Error fetching worker efficiency data:', error);
    res.status(500).json({ error: 'Failed to fetch worker efficiency data' });
  }
});

// Get video analytics data
router.get('/video-analytics', auth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    switch (period) {
      case '1d':
        dateFilter = 'WHERE DATE(v.created_at) = CURRENT_DATE';
        break;
      case '7d':
        dateFilter = 'WHERE v.created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'WHERE v.created_at >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      default:
        dateFilter = 'WHERE v.created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
    }

    const result = await db.query(`
      SELECT 
        DATE(v.created_at) as date,
        COUNT(*) as video_count,
        SUM(v.duration) as total_duration,
        AVG(v.duration) as avg_duration,
        SUM(v.file_size) as total_size
      FROM videos v
      ${dateFilter}
      GROUP BY DATE(v.created_at)
      ORDER BY date DESC
    `, params);

    const videoAnalyticsData = {
      period,
      dailyStats: result.rows.map(row => ({
        date: row.date,
        videoCount: parseInt(row.video_count),
        totalDuration: parseFloat(row.total_duration || 0),
        avgDuration: parseFloat(row.avg_duration || 0),
        totalSize: parseFloat(row.total_size || 0)
      }))
    };

    res.json(videoAnalyticsData);
  } catch (error) {
    logger.error('Error fetching video analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch video analytics data' });
  }
});

// Get safety alerts and incidents
router.get('/safety-alerts', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        'low_battery' as type,
        h.id as helmet_id,
        w.name as worker_name,
        'Low battery detected' as message,
        h.battery_level as value,
        h.last_updated as timestamp
      FROM helmets h
      LEFT JOIN workers w ON h.worker_id = w.id
      WHERE h.battery_level < 20 AND h.status = 'assigned'
      
      UNION ALL
      
      SELECT 
        'offline_helmet' as type,
        h.id as helmet_id,
        w.name as worker_name,
        'Helmet offline for extended period' as message,
        EXTRACT(EPOCH FROM (NOW() - h.last_updated))/3600 as value,
        h.last_updated as timestamp
      FROM helmets h
      LEFT JOIN workers w ON h.worker_id = w.id
      WHERE h.last_updated < NOW() - INTERVAL '2 hours' AND h.status = 'assigned'
      
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    const safetyAlertsData = result.rows.map(row => ({
      type: row.type,
      helmetId: row.helmet_id,
      workerName: row.worker_name,
      message: row.message,
      value: parseFloat(row.value),
      timestamp: row.timestamp,
      severity: row.type === 'low_battery' ? (row.value < 10 ? 'high' : 'medium') : 'high'
    }));

    res.json(safetyAlertsData);
  } catch (error) {
    logger.error('Error fetching safety alerts:', error);
    res.status(500).json({ error: 'Failed to fetch safety alerts' });
  }
});

// Get real-time metrics for dashboard
router.get('/realtime', auth, async (req, res) => {
  try {
    // Get current active sessions
    const activeSessionsResult = await db.query(`
      SELECT COUNT(*) as active_sessions
      FROM sessions 
      WHERE status = 'active'
    `);

    // Get helmets currently streaming
    const streamingHelmetsResult = await db.query(`
      SELECT COUNT(*) as streaming_helmets
      FROM helmets 
      WHERE status = 'streaming'
    `);

    // Get recent activity
    const recentActivityResult = await db.query(`
      SELECT 
        'session_started' as type,
        s.id,
        w.name as worker_name,
        p.name as project_name,
        s.created_at as timestamp
      FROM sessions s
      JOIN workers w ON s.worker_id = w.id
      JOIN projects p ON s.project_id = p.id
      WHERE s.created_at >= NOW() - INTERVAL '1 hour'
      
      UNION ALL
      
      SELECT 
        'video_uploaded' as type,
        v.id,
        w.name as worker_name,
        p.name as project_name,
        v.created_at as timestamp
      FROM videos v
      JOIN sessions s ON v.session_id = s.id
      JOIN workers w ON s.worker_id = w.id
      JOIN projects p ON s.project_id = p.id
      WHERE v.created_at >= NOW() - INTERVAL '1 hour'
      
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    const realtimeData = {
      activeSessions: parseInt(activeSessionsResult.rows[0]?.active_sessions || 0),
      streamingHelmets: parseInt(streamingHelmetsResult.rows[0]?.streaming_helmets || 0),
      recentActivity: recentActivityResult.rows.map(row => ({
        type: row.type,
        id: row.id,
        workerName: row.worker_name,
        projectName: row.project_name,
        timestamp: row.timestamp
      }))
    };

    res.json(realtimeData);
  } catch (error) {
    logger.error('Error fetching real-time data:', error);
    res.status(500).json({ error: 'Failed to fetch real-time data' });
  }
});

module.exports = router; 