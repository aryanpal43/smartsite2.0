const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get all workers
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, projectId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND w.status = $${paramCount}`;
      params.push(status);
    }

    if (projectId) {
      paramCount++;
      whereClause += ` AND w.project_id = $${paramCount}`;
      params.push(projectId);
    }

    const result = await db.query(
      `SELECT w.*, p.name as project_name
       FROM workers w
       LEFT JOIN projects p ON w.project_id = p.id
       ${whereClause}
       ORDER BY w.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        workers: result.rows
      }
    });
  } catch (error) {
    logger.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get worker by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT w.*, p.name as project_name
       FROM workers w
       LEFT JOIN projects p ON w.project_id = p.id
       WHERE w.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    const worker = result.rows[0];

    res.json({
      success: true,
      data: {
        worker
      }
    });
  } catch (error) {
    logger.error('Get worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create worker
router.post('/', protect, async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, phone, position, hourlyRate, projectId } = req.body;

    if (!employeeId || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID, First Name, and Last Name are required'
      });
    }

    const result = await db.query(
      `INSERT INTO workers (employee_id, first_name, last_name, email, phone, position, hourly_rate, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [employeeId, firstName, lastName, email, phone, position, hourlyRate, projectId]
    );

    const worker = result.rows[0];

    logger.info(`Worker created: ${firstName} ${lastName}`);

    res.status(201).json({
      success: true,
      data: {
        worker
      }
    });
  } catch (error) {
    logger.error('Create worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update worker
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, position, hourlyRate, projectId, status } = req.body;

    const result = await db.query(
      `UPDATE workers SET 
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       email = COALESCE($3, email),
       phone = COALESCE($4, phone),
       position = COALESCE($5, position),
       hourly_rate = COALESCE($6, hourly_rate),
       project_id = COALESCE($7, project_id),
       status = COALESCE($8, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [firstName, lastName, email, phone, position, hourlyRate, projectId, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found'
      });
    }

    const worker = result.rows[0];

    res.json({
      success: true,
      data: {
        worker
      }
    });
  } catch (error) {
    logger.error('Update worker error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get worker performance
router.get('/:id/performance', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [id];

    if (startDate && endDate) {
      dateFilter = 'AND pm.date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    const result = await db.query(
      `SELECT pm.*, s.start_time, s.end_time
       FROM performance_metrics pm
       LEFT JOIN sessions s ON pm.session_id = s.id
       WHERE pm.worker_id = $1 ${dateFilter}
       ORDER BY pm.date DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        performance: result.rows
      }
    });
  } catch (error) {
    logger.error('Get worker performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 