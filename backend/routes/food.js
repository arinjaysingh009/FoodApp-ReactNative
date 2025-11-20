const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/authMiddleware');

// @route   GET /api/food/categories
// @desc    Get all food categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM food_categories WHERE is_active = true ORDER BY name'
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/food/items
// @desc    Get all food items with filters
// @access  Public
router.get('/items', optionalAuth, async (req, res) => {
  try {
    const { category, search, vegetarian, vegan, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT fi.*, fc.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as rating_count
      FROM food_items fi
      LEFT JOIN food_categories fc ON fi.category_id = fc.id
      LEFT JOIN ratings r ON fi.id = r.food_item_id AND r.rating_type = 'food'
      WHERE fi.is_available = true
    `;
    
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND fi.category_id = $${paramCount++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (fi.name ILIKE $${paramCount++} OR fi.description ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (vegetarian === 'true') {
      query += ' AND fi.is_vegetarian = true';
    }

    if (vegan === 'true') {
      query += ' AND fi.is_vegan = true';
    }

    if (minPrice) {
      query += ` AND fi.price >= $${paramCount++}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND fi.price <= $${paramCount++}`;
      params.push(maxPrice);
    }

    query += ' GROUP BY fi.id, fc.name ORDER BY fi.name';

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM food_items fi WHERE fi.is_available = true';
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND fi.category_id = $${countParamIndex++}`;
      countParams.push(category);
    }

    if (search) {
      countQuery += ` AND (fi.name ILIKE $${countParamIndex++} OR fi.description ILIKE $${countParamIndex++})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      count: result.rows.length,
      total: totalItems,
      page: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      data: result.rows
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/food/items/:id
// @desc    Get single food item by ID
// @access  Public
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT fi.*, fc.name as category_name,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(r.id) as rating_count
       FROM food_items fi
       LEFT JOIN food_categories fc ON fi.category_id = fc.id
       LEFT JOIN ratings r ON fi.id = r.food_item_id AND r.rating_type = 'food'
       WHERE fi.id = $1
       GROUP BY fi.id, fc.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/food/items
// @desc    Create new food item (Admin only)
// @access  Private/Admin
router.post('/items', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      isVegetarian = false,
      isVegan = false,
      preparationTime,
      calories
    } = req.body;

    if (!categoryId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, name, and price'
      });
    }

    const result = await pool.query(
      `INSERT INTO food_items 
       (category_id, name, description, price, image_url, is_vegetarian, is_vegan, preparation_time, calories, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [categoryId, name, description, price, imageUrl, isVegetarian, isVegan, preparationTime, calories, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/food/items/:id
// @desc    Update food item (Admin only)
// @access  Private/Admin
router.put('/items/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      isAvailable,
      isVegetarian,
      isVegan,
      preparationTime,
      calories
    } = req.body;

    const result = await pool.query(
      `UPDATE food_items 
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           image_url = COALESCE($5, image_url),
           is_available = COALESCE($6, is_available),
           is_vegetarian = COALESCE($7, is_vegetarian),
           is_vegan = COALESCE($8, is_vegan),
           preparation_time = COALESCE($9, preparation_time),
           calories = COALESCE($10, calories),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [categoryId, name, description, price, imageUrl, isAvailable, isVegetarian, isVegan, preparationTime, calories, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/food/items/:id
// @desc    Delete food item (Admin only)
// @access  Private/Admin
router.delete('/items/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM food_items WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/food/items/:id/toggle
// @desc    Toggle food item availability (Admin only)
// @access  Private/Admin
router.patch('/items/:id/toggle', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE food_items 
       SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    res.json({
      success: true,
      message: `Food item ${result.rows[0].is_available ? 'enabled' : 'disabled'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle food item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
