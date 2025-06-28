const express = require('express');
// const { protect } = require('../middleware/auth'); // TEMPORARILY DISABLED
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get all projects - TEMPORARILY NO AUTH
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT * FROM projects ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        projects: result.rows
      }
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get project by ID - TEMPORARILY NO AUTH
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = result.rows[0];

    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create project - TEMPORARILY NO AUTH
router.post('/', async (req, res) => {
  try {
    const { name, description, location, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const result = await db.query(
      `INSERT INTO projects (name, description, location, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [name, description, location, startDate, endDate]
    );

    const project = result.rows[0];

    logger.info(`Project created: ${name}`);

    res.status(201).json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update project - TEMPORARILY NO AUTH
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, startDate, endDate, status } = req.body;

    const result = await db.query(
      `UPDATE projects SET 
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       location = COALESCE($3, location),
       start_date = COALESCE($4, start_date),
       end_date = COALESCE($5, end_date),
       status = COALESCE($6, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, location, startDate, endDate, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = result.rows[0];

    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;