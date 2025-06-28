const express = require('express');
const Joi = require('joi');
// const { protect } = require('../middleware/auth'); // TEMPORARILY DISABLED
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Create new session (assign helmet to worker) - TEMPORARILY NO AUTH
router.post('/', async (req, res) => {
  try {
    const { helmetId, workerId, projectId, notes } = req.body;

    if (!helmetId || !workerId || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Helmet ID, Worker ID, and Project ID are required'
      });
    }

    // Check if helmet is available
    const helmetResult = await db.query(
      'SELECT * FROM helmets WHERE id = $1 AND status = $2',
      [helmetId, 'available']
    );

    if (helmetResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Helmet is not available'
      });
    }

    // Check if worker already has an active session
    const activeSessionResult = await db.query(
      'SELECT * FROM sessions WHERE worker_id = $1 AND status = $2',
      [workerId, 'active']
    );

    if (activeSessionResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Worker already has an active session'
      });
    }

    // Create session
    const sessionResult = await db.query(
      `INSERT INTO sessions (helmet_id, worker_id, project_id, start_time, notes)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
       RETURNING *`,
      [helmetId, workerId, projectId, notes]
    );

    const session = sessionResult.rows[0];

    // Update helmet status
    await db.query(
      'UPDATE helmets SET status = $1 WHERE id = $2',
      ['in_use', helmetId]
    );

    logger.info(`Session created: Helmet ${helmetId} assigned to Worker ${workerId}`);

    res.status(201).json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all sessions - TEMPORARILY NO AUTH
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT s.*, 
              w.first_name, w.last_name, w.employee_id,
              h.helmet_id as helmet_identifier, h.name as helmet_name,
              p.name as project_name
       FROM sessions s
       LEFT JOIN workers w ON s.worker_id = w.id
       LEFT JOIN helmets h ON s.helmet_id = h.id
       LEFT JOIN projects p ON s.project_id = p.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        sessions: result.rows
      }
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get session by ID - TEMPORARILY NO AUTH
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT s.*, 
              w.first_name, w.last_name, w.employee_id,
              h.helmet_id as helmet_identifier, h.name as helmet_name,
              p.name as project_name
       FROM sessions s
       LEFT JOIN workers w ON s.worker_id = w.id
       LEFT JOIN helmets h ON s.helmet_id = h.id
       LEFT JOIN projects p ON s.project_id = p.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const session = result.rows[0];

    res.json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// End session - TEMPORARILY NO AUTH
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const sessionResult = await db.query(
      'SELECT * FROM sessions WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Active session not found'
      });
    }

    const session = sessionResult.rows[0];

    // End session
    const updateResult = await db.query(
      `UPDATE sessions SET end_time = CURRENT_TIMESTAMP, status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    const updatedSession = updateResult.rows[0];

    // Free up helmet
    await db.query(
      'UPDATE helmets SET status = $1 WHERE id = $2',
      ['available', session.helmet_id]
    );

    logger.info(`Session ended: ${id}, Helmet ${session.helmet_id} freed`);

    res.json({
      success: true,
      data: {
        session: updatedSession
      }
    });
  } catch (error) {
    logger.error('End session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get active sessions
router.get('/active', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, 
              w.first_name, w.last_name, w.employee_id,
              h.helmet_id as helmet_identifier, h.name as helmet_name,
              p.name as project_name
       FROM sessions s
       LEFT JOIN workers w ON s.worker_id = w.id
       LEFT JOIN helmets h ON s.helmet_id = h.id
       LEFT JOIN projects p ON s.project_id = p.id
       WHERE s.status = 'active'
       ORDER BY s.start_time DESC`
    );

    res.json({
      success: true,
      data: {
        sessions: result.rows
      }
    });
  } catch (error) {
    logger.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 