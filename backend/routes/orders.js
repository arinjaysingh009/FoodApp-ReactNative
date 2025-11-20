const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { publishEvent, TOPICS } = require('../config/kafka');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items, addressId, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items'
      });
    }

    await client.query('BEGIN');

    // Calculate order totals
    let totalAmount = 0;
    for (const item of items) {
      const foodItem = await client.query(
        'SELECT price FROM food_items WHERE id = $1 AND is_available = true',
        [item.foodItemId]
      );

      if (foodItem.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Food item ${item.foodItemId} not available`
        });
      }

      totalAmount += foodItem.rows[0].price * item.quantity;
    }

    const taxAmount = totalAmount * 0.1;
    const deliveryFee = 5.00;
    const finalAmount = totalAmount + taxAmount + deliveryFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, address_id, order_number, total_amount, tax_amount, delivery_fee, final_amount, special_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, addressId, orderNumber, totalAmount, taxAmount, deliveryFee, finalAmount, specialInstructions]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      const foodItem = await client.query(
        'SELECT price FROM food_items WHERE id = $1',
        [item.foodItemId]
      );

      await client.query(
        `INSERT INTO order_items (order_id, food_item_id, quantity, unit_price, total_price, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.foodItemId, item.quantity, foodItem.rows[0].price, 
         foodItem.rows[0].price * item.quantity, item.specialRequests]
      );
    }

    await client.query('COMMIT');

    // Publish order created event to Kafka
    try {
      await publishEvent(TOPICS.ORDER_CREATED, {
        orderId: order.id,
        orderNumber: order.order_number,
        userId: req.user.id,
        totalAmount: order.final_amount,
        timestamp: new Date().toISOString()
      });
    } catch (kafkaError) {
      console.error('Kafka publish error:', kafkaError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
});

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT o.*, u.full_name as user_name, u.email as user_email,
               COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, u.full_name, u.email
        ORDER BY o.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT o.*, COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, u.full_name as user_name, u.email as user_email, u.phone as user_phone,
              ua.street_address, ua.city, ua.state, ua.postal_code
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN user_addresses ua ON o.address_id = ua.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, fi.name as food_name, fi.image_url
       FROM order_items oi
       LEFT JOIN food_items fi ON oi.food_item_id = fi.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.patch('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP,
           delivered_at = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
           cancelled_at = CASE WHEN $1 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE cancelled_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = result.rows[0];

    // Publish status update event to Kafka
    try {
      const topicMap = {
        'confirmed': TOPICS.ORDER_CONFIRMED,
        'preparing': TOPICS.ORDER_PREPARING,
        'out_for_delivery': TOPICS.ORDER_OUT_FOR_DELIVERY,
        'delivered': TOPICS.ORDER_DELIVERED,
        'cancelled': TOPICS.ORDER_CANCELLED
      };

      if (topicMap[status]) {
        await publishEvent(topicMap[status], {
          orderId: order.id,
          orderNumber: order.order_number,
          status,
          timestamp: new Date().toISOString()
        });
      }
    } catch (kafkaError) {
      console.error('Kafka publish error:', kafkaError);
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status ${order.status}`
      });
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = 'cancelled', cancellation_reason = $1, cancelled_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
