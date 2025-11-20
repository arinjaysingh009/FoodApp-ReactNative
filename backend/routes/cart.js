const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.*, fi.name, fi.description, fi.price, fi.image_url, fi.is_available
       FROM cart_items ci
       LEFT JOIN food_items fi ON ci.food_item_id = fi.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const cartTotal = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      count: result.rows.length,
      cartTotal,
      data: result.rows
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { foodItemId, quantity = 1, specialRequests } = req.body;

    if (!foodItemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food item ID'
      });
    }

    // Check if food item exists and is available
    const foodItem = await pool.query(
      'SELECT * FROM food_items WHERE id = $1 AND is_available = true',
      [foodItemId]
    );

    if (foodItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found or unavailable'
      });
    }

    // Check if item already in cart
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND food_item_id = $2',
      [req.user.id, foodItemId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update quantity
      result = await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1, special_requests = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND food_item_id = $4
         RETURNING *`,
        [quantity, specialRequests, req.user.id, foodItemId]
      );
    } else {
      // Insert new item
      result = await pool.query(
        `INSERT INTO cart_items (user_id, food_item_id, quantity, special_requests)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.user.id, foodItemId, quantity, specialRequests]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const result = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Cart updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
