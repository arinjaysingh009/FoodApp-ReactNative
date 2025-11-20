const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');

class PaymentService {
  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd', orderId, userId) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          orderId: orderId.toString(),
          userId: userId.toString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment intent in database
      await this.storePaymentIntent(orderId, userId, paymentIntent.id, amount);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Store payment intent in database
  async storePaymentIntent(orderId, userId, paymentIntentId, amount) {
    try {
      const query = `
        INSERT INTO payments (order_id, user_id, stripe_payment_intent_id, amount, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
      `;
      
      const result = await pool.query(query, [orderId, userId, paymentIntentId, amount]);
      return result.rows[0];
    } catch (error) {
      console.error('Error storing payment intent:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update payment status in database
        await this.updatePaymentStatus(paymentIntentId, 'completed');
        return {
          success: true,
          status: 'completed',
          amount: paymentIntent.amount / 100,
          orderId: paymentIntent.metadata.orderId
        };
      }

      return {
        success: false,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentIntentId, status) {
    try {
      const query = `
        UPDATE payments
        SET status = $1, updated_at = NOW()
        WHERE stripe_payment_intent_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, paymentIntentId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      // Store refund in database
      await this.storeRefund(paymentIntentId, refund.id, refund.amount / 100, reason);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Store refund in database
  async storeRefund(paymentIntentId, refundId, amount, reason) {
    try {
      const query = `
        INSERT INTO refunds (payment_intent_id, stripe_refund_id, amount, reason, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
      `;
      
      const result = await pool.query(query, [paymentIntentId, refundId, amount, reason]);
      return result.rows[0];
    } catch (error) {
      console.error('Error storing refund:', error);
      throw error;
    }
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    try {
      const query = `
        SELECT * FROM payments
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [orderId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  // Get payment history for user
  async getPaymentHistory(userId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT p.*, o.status as order_status
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Handle webhook events from Stripe
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        
        case 'refund.created':
          await this.handleRefundCreated(event.data.object);
          break;
        
        case 'refund.updated':
          await this.handleRefundUpdated(event.data.object);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentIntent) {
    try {
      await this.updatePaymentStatus(paymentIntent.id, 'completed');
      
      // Update order status
      const orderId = paymentIntent.metadata.orderId;
      await pool.query(
        'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2',
        ['paid', orderId]
      );

      console.log(`Payment succeeded for order ${orderId}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Handle failed payment
  async handlePaymentFailure(paymentIntent) {
    try {
      await this.updatePaymentStatus(paymentIntent.id, 'failed');
      
      // Update order status
      const orderId = paymentIntent.metadata.orderId;
      await pool.query(
        'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2',
        ['failed', orderId]
      );

      console.log(`Payment failed for order ${orderId}`);
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  // Handle refund created
  async handleRefundCreated(refund) {
    try {
      const query = `
        UPDATE refunds
        SET status = $1, updated_at = NOW()
        WHERE stripe_refund_id = $2
      `;
      
      await pool.query(query, ['processing', refund.id]);
      console.log(`Refund created: ${refund.id}`);
    } catch (error) {
      console.error('Error handling refund created:', error);
      throw error;
    }
  }

  // Handle refund updated
  async handleRefundUpdated(refund) {
    try {
      const query = `
        UPDATE refunds
        SET status = $1, updated_at = NOW()
        WHERE stripe_refund_id = $2
      `;
      
      await pool.query(query, [refund.status, refund.id]);
      console.log(`Refund updated: ${refund.id} - ${refund.status}`);
    } catch (error) {
      console.error('Error handling refund updated:', error);
      throw error;
    }
  }

  // Construct webhook event from request
  constructWebhookEvent(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
