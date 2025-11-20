const { Kafka, logLevel } = require('kafkajs');

// Kafka Configuration for Order Tracking
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'foodapp-backend',
  brokers: (process.env.KAFKA_BROKER || 'localhost:9092').split(','),
  logLevel: logLevel.INFO,
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Producer for publishing order tracking events
const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});

// Consumer for consuming order tracking events
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || 'foodapp-order-tracking-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

// Admin client for managing topics
const admin = kafka.admin();

// Topics configuration
const TOPICS = {
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_PREPARING: 'order.preparing',
  ORDER_OUT_FOR_DELIVERY: 'order.out_for_delivery',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed'
};

// Connect producer
const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('✓ Kafka producer connected successfully');
  } catch (error) {
    console.error('✗ Failed to connect Kafka producer:', error.message);
    throw error;
  }
};

// Connect consumer
const connectConsumer = async () => {
  try {
    await consumer.connect();
    console.log('✓ Kafka consumer connected successfully');
    
    // Subscribe to all order-related topics
    await consumer.subscribe({
      topics: Object.values(TOPICS),
      fromBeginning: false
    });
    
    console.log('✓ Kafka consumer subscribed to topics:', Object.values(TOPICS).join(', '));
  } catch (error) {
    console.error('✗ Failed to connect Kafka consumer:', error.message);
    throw error;
  }
};

// Create topics if they don't exist
const createTopics = async () => {
  try {
    await admin.connect();
    const topics = Object.values(TOPICS).map(topic => ({
      topic,
      numPartitions: 3,
      replicationFactor: 1
    }));
    
    await admin.createTopics({
      topics,
      waitForLeaders: true
    });
    
    console.log('✓ Kafka topics created/verified successfully');
    await admin.disconnect();
  } catch (error) {
    console.error('✗ Failed to create Kafka topics:', error.message);
    await admin.disconnect();
  }
};

// Publish event to Kafka
const publishEvent = async (topic, event) => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: event.orderId || event.id,
          value: JSON.stringify(event),
          timestamp: Date.now().toString()
        }
      ]
    });
    console.log(`✓ Event published to topic ${topic}:`, event);
  } catch (error) {
    console.error(`✗ Failed to publish event to topic ${topic}:`, error.message);
    throw error;
  }
};

// Consume events from Kafka
const startConsuming = async (handlers) => {
  try {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log(`✓ Received event from topic ${topic}:`, event);
        
        // Call the appropriate handler based on topic
        if (handlers[topic]) {
          try {
            await handlers[topic](event);
          } catch (error) {
            console.error(`✗ Error handling event from topic ${topic}:`, error.message);
          }
        }
      }
    });
  } catch (error) {
    console.error('✗ Error consuming Kafka events:', error.message);
    throw error;
  }
};

// Graceful shutdown
const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log('✓ Kafka connections closed gracefully');
  } catch (error) {
    console.error('✗ Error disconnecting Kafka:', error.message);
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  admin,
  TOPICS,
  connectProducer,
  connectConsumer,
  createTopics,
  publishEvent,
  startConsuming,
  disconnectKafka
};
