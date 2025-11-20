const { producer, consumer, connectKafka } = require('../config/kafka');

class KafkaService {
  constructor() {
    this.isConnected = false;
  }

  // Initialize Kafka connection
  async initialize() {
    if (this.isConnected) {
      console.log('Kafka already connected');
      return;
    }

    try {
      await connectKafka();
      this.isConnected = true;
      console.log('Kafka service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Kafka service:', error);
      throw error;
    }
  }

  // Publish order created event
  async publishOrderCreated(orderData) {
    try {
      await producer.send({
        topic: 'order-events',
        messages: [
          {
            key: orderData.orderId.toString(),
            value: JSON.stringify({
              event: 'ORDER_CREATED',
              orderId: orderData.orderId,
              userId: orderData.userId,
              items: orderData.items,
              total: orderData.total,
              status: orderData.status,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('Order created event published:', orderData.orderId);
    } catch (error) {
      console.error('Error publishing order created event:', error);
      throw error;
    }
  }

  // Publish order status updated event
  async publishOrderStatusUpdated(orderId, oldStatus, newStatus, userId) {
    try {
      await producer.send({
        topic: 'order-events',
        messages: [
          {
            key: orderId.toString(),
            value: JSON.stringify({
              event: 'ORDER_STATUS_UPDATED',
              orderId,
              userId,
              oldStatus,
              newStatus,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log(`Order status updated event published: ${orderId} - ${oldStatus} -> ${newStatus}`);
    } catch (error) {
      console.error('Error publishing order status update:', error);
      throw error;
    }
  }

  // Publish order cancelled event
  async publishOrderCancelled(orderId, userId, reason) {
    try {
      await producer.send({
        topic: 'order-events',
        messages: [
          {
            key: orderId.toString(),
            value: JSON.stringify({
              event: 'ORDER_CANCELLED',
              orderId,
              userId,
              reason,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('Order cancelled event published:', orderId);
    } catch (error) {
      console.error('Error publishing order cancelled event:', error);
      throw error;
    }
  }

  // Publish payment processed event
  async publishPaymentProcessed(paymentData) {
    try {
      await producer.send({
        topic: 'payment-events',
        messages: [
          {
            key: paymentData.orderId.toString(),
            value: JSON.stringify({
              event: 'PAYMENT_PROCESSED',
              orderId: paymentData.orderId,
              userId: paymentData.userId,
              amount: paymentData.amount,
              paymentMethod: paymentData.paymentMethod,
              transactionId: paymentData.transactionId,
              status: paymentData.status,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('Payment processed event published:', paymentData.orderId);
    } catch (error) {
      console.error('Error publishing payment event:', error);
      throw error;
    }
  }

  // Publish user registered event
  async publishUserRegistered(userData) {
    try {
      await producer.send({
        topic: 'user-events',
        messages: [
          {
            key: userData.userId.toString(),
            value: JSON.stringify({
              event: 'USER_REGISTERED',
              userId: userData.userId,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('User registered event published:', userData.userId);
    } catch (error) {
      console.error('Error publishing user registered event:', error);
      throw error;
    }
  }

  // Publish food item updated event
  async publishFoodItemUpdated(foodData) {
    try {
      await producer.send({
        topic: 'food-events',
        messages: [
          {
            key: foodData.itemId.toString(),
            value: JSON.stringify({
              event: 'FOOD_ITEM_UPDATED',
              itemId: foodData.itemId,
              name: foodData.name,
              isAvailable: foodData.isAvailable,
              price: foodData.price,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('Food item updated event published:', foodData.itemId);
    } catch (error) {
      console.error('Error publishing food item update:', error);
      throw error;
    }
  }

  // Subscribe to order events
  async subscribeToOrderEvents(callback) {
    try {
      await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            console.log('Received order event:', event.event);
            await callback(event);
          } catch (error) {
            console.error('Error processing order event:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to order events:', error);
      throw error;
    }
  }

  // Subscribe to payment events
  async subscribeToPaymentEvents(callback) {
    try {
      await consumer.subscribe({ topic: 'payment-events', fromBeginning: false });
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = JSON.parse(message.value.toString());
            console.log('Received payment event:', event.event);
            await callback(event);
          } catch (error) {
            console.error('Error processing payment event:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to payment events:', error);
      throw error;
    }
  }

  // Disconnect Kafka
  async disconnect() {
    try {
      await producer.disconnect();
      await consumer.disconnect();
      this.isConnected = false;
      console.log('Kafka service disconnected');
    } catch (error) {
      console.error('Error disconnecting Kafka:', error);
      throw error;
    }
  }

  // Get connection status
  isKafkaConnected() {
    return this.isConnected;
  }
}

module.exports = new KafkaService();
