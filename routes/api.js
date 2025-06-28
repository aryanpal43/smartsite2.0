const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// ===== DASHBOARD ENDPOINTS =====

// Get main dashboard data
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

// ===== HELMET ENDPOINTS =====

// Get all helmets with status
router.get('/helmets', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        h.id,
        h.status,
        h.battery_level,
        h.last_used,
        h.condition,
        w.name as assigned_worker_name,
        w.id as assigned_worker_id
      FROM helmets h
      LEFT JOIN workers w ON h.worker_id = w.id
      ORDER BY h.id
    `);

    const helmets = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      battery: `${row.battery_level}%`,
      lastUsed: row.last_used ? new Date(row.last_used).toISOString().split('T')[0] : 'Never',
      condition: row.condition || 'Good',
      assignedWorker: row.assigned_worker_name || 'None',
      assignedWorkerId: row.assigned_worker_id
    }));

    res.json(helmets);
  } catch (error) {
    logger.error('Error fetching helmets:', error);
    res.status(500).json({ error: 'Failed to fetch helmets' });
  }
});

// Search available helmets
router.get('/helmets/available', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        h.id,
        h.status,
        h.battery_level,
        h.last_used,
        h.condition
      FROM helmets h
      WHERE h.status = 'available'
    `;
    
    const params = [];
    if (search) {
      query += ` AND h.id ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY h.id`;

    const result = await db.query(query, params);
    const helmets = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      battery: `${row.battery_level}%`,
      lastUsed: row.last_used ? new Date(row.last_used).toISOString().split('T')[0] : 'Never',
      condition: row.condition || 'Good'
    }));

    res.json(helmets);
  } catch (error) {
    logger.error('Error searching helmets:', error);
    res.status(500).json({ error: 'Failed to search helmets' });
  }
});

// Assign helmet to worker
router.post('/helmets/assign', auth, async (req, res) => {
  try {
    const { helmetId, workerId } = req.body;

    // Check if helmet is available
    const helmetCheck = await db.query(
      'SELECT status FROM helmets WHERE id = $1',
      [helmetId]
    );

    if (helmetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Helmet not found' });
    }

    if (helmetCheck.rows[0].status !== 'available') {
      return res.status(400).json({ error: 'Helmet is not available' });
    }

    // Check if worker exists
    const workerCheck = await db.query(
      'SELECT id FROM workers WHERE id = $1',
      [workerId]
    );

    if (workerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Assign helmet to worker
    await db.query(
      'UPDATE helmets SET status = $1, worker_id = $2, last_used = NOW() WHERE id = $3',
      ['assigned', workerId, helmetId]
    );

    await db.query(
      'UPDATE workers SET helmet_id = $1 WHERE id = $2',
      [helmetId, workerId]
    );

    res.json({ message: 'Helmet assigned successfully' });
  } catch (error) {
    logger.error('Error assigning helmet:', error);
    res.status(500).json({ error: 'Failed to assign helmet' });
  }
});

// Deassign helmet from worker
router.post('/helmets/deassign', auth, async (req, res) => {
  try {
    const { helmetId } = req.body;

    // Get worker ID from helmet
    const helmetResult = await db.query(
      'SELECT worker_id FROM helmets WHERE id = $1',
      [helmetId]
    );

    if (helmetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Helmet not found' });
    }

    const workerId = helmetResult.rows[0].worker_id;

    // Deassign helmet
    await db.query(
      'UPDATE helmets SET status = $1, worker_id = NULL WHERE id = $2',
      ['available', helmetId]
    );

    if (workerId) {
      await db.query(
        'UPDATE workers SET helmet_id = NULL WHERE id = $1',
        [workerId]
      );
    }

    res.json({ message: 'Helmet deassigned successfully' });
  } catch (error) {
    logger.error('Error deassigning helmet:', error);
    res.status(500).json({ error: 'Failed to deassign helmet' });
  }
});

// ===== WORKER ENDPOINTS =====

// Get all workers
router.get('/workers', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        w.id,
        w.name,
        w.role,
        w.department,
        h.id as helmet_id,
        h.status as helmet_status
      FROM workers w
      LEFT JOIN helmets h ON w.helmet_id = h.id
      ORDER BY w.name
    `);

    const workers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      helmetAssigned: row.helmet_id || 'None',
      helmetStatus: row.helmet_status || 'None'
    }));

    res.json(workers);
  } catch (error) {
    logger.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Search workers
router.get('/workers/search', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        w.id,
        w.name,
        w.role,
        w.department,
        h.id as helmet_id,
        h.status as helmet_status
      FROM workers w
      LEFT JOIN helmets h ON w.helmet_id = h.id
      WHERE (w.name ILIKE $1 OR w.id ILIKE $1)
    `;
    
    const params = [`%${search}%`];
    query += ` ORDER BY w.name`;

    const result = await db.query(query, params);
    const workers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      helmetAssigned: row.helmet_id || 'None',
      helmetStatus: row.helmet_status || 'None'
    }));

    res.json(workers);
  } catch (error) {
    logger.error('Error searching workers:', error);
    res.status(500).json({ error: 'Failed to search workers' });
  }
});

// Add new worker
router.post('/workers', auth, async (req, res) => {
  try {
    const { name, role, department } = req.body;

    const result = await db.query(
      'INSERT INTO workers (name, role, department) VALUES ($1, $2, $3) RETURNING id, name, role, department',
      [name, role, department]
    );

    const newWorker = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      role: result.rows[0].role,
      department: result.rows[0].department,
      helmetAssigned: 'None',
      helmetStatus: 'None'
    };

    res.status(201).json(newWorker);
  } catch (error) {
    logger.error('Error adding worker:', error);
    res.status(500).json({ error: 'Failed to add worker' });
  }
});

// ===== PROJECT ENDPOINTS =====

// Get all projects
router.get('/projects', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.progress,
        p.start_date,
        p.end_date,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT v.id) as total_videos
      FROM projects p
      LEFT JOIN sessions s ON p.id = s.project_id
      LEFT JOIN videos v ON s.id = v.session_id
      GROUP BY p.id, p.name, p.description, p.status, p.progress, p.start_date, p.end_date
      ORDER BY p.created_at DESC
    `);

    const projects = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      progress: parseFloat(row.progress || 0),
      startDate: row.start_date,
      endDate: row.end_date,
      totalSessions: parseInt(row.total_sessions || 0),
      totalVideos: parseInt(row.total_videos || 0)
    }));

    res.json(projects);
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Add new project
router.post('/projects', auth, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const result = await db.query(
      'INSERT INTO projects (name, description, start_date, end_date, status, progress) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, startDate, endDate, 'active', 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// ===== HELMET STATUS CHART DATA =====

// Get helmet status for charts
router.get('/helmets/status-chart', auth, async (req, res) => {
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
    logger.error('Error fetching helmet status chart data:', error);
    res.status(500).json({ error: 'Failed to fetch helmet status chart data' });
  }
});

// ===== REAL-TIME DATA =====

// Get real-time metrics
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
      SELECT COUNT(*) as active_helmets
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
      activeHelmets: parseInt(streamingHelmetsResult.rows[0]?.active_helmets || 0),
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