const express = require('express');
// const { protect } = require('../middleware/auth'); // TEMPORARILY DISABLED
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get all helmets with assignment info - TEMPORARILY NO AUTH
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND h.status = $${paramCount}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT h.*, (w.first_name || ' ' || w.last_name) AS assigned_to
       FROM helmets h
       LEFT JOIN workers w ON h.status = 'assigned' AND w.helmet_id = h.helmet_id
       ${whereClause}
       ORDER BY h.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        helmets: result.rows
      }
    });
  } catch (error) {
    logger.error('Get helmets error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get helmet by ID - TEMPORARILY NO AUTH
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM helmets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Helmet not found'
      });
    }

    const helmet = result.rows[0];

    res.json({
      success: true,
      data: {
        helmet
      }
    });
  } catch (error) {
    logger.error('Get helmet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create helmet - TEMPORARILY NO AUTH
router.post('/', async (req, res) => {
  try {
    const { helmetId, name, model } = req.body;

    if (!helmetId) {
      return res.status(400).json({
        success: false,
        error: 'Helmet ID is required'
      });
    }

    const result = await db.query(
      `INSERT INTO helmets (helmet_id, name, model, status, battery_level)
       VALUES ($1, $2, $3, 'available', 100)
       RETURNING *`,
      [helmetId, name, model]
    );

    const helmet = result.rows[0];

    logger.info(`Helmet created: ${helmetId}`);

    // Return all helmets after adding
    const allHelmets = await db.query('SELECT * FROM helmets ORDER BY created_at DESC');

    res.status(201).json({
      success: true,
      data: {
        helmet,
        helmets: allHelmets.rows
      }
    });
  } catch (error) {
    logger.error('Create helmet error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'Helmet ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update helmet - TEMPORARILY NO AUTH
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, status, batteryLevel, lastMaintenance } = req.body;

    const result = await db.query(
      `UPDATE helmets SET 
       name = COALESCE($1, name),
       model = COALESCE($2, model),
       status = COALESCE($3, status),
       battery_level = COALESCE($4, battery_level),
       last_maintenance = COALESCE($5, last_maintenance),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, model, status, batteryLevel, lastMaintenance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Helmet not found'
      });
    }

    const helmet = result.rows[0];

    res.json({
      success: true,
      data: {
        helmet
      }
    });
  } catch (error) {
    logger.error('Update helmet error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get available helmets - TEMPORARILY NO AUTH
router.get('/available', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM helmets WHERE status = $1 ORDER BY name',
      ['available']
    );

    res.json({
      success: true,
      data: {
        helmets: result.rows
      }
    });
  } catch (error) {
    logger.error('Get available helmets error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 