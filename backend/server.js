require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');

// Database connections
const { connectPostgres, connectMongoDB } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/order', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Client joined order room: order-${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Start server
const startServer = async () => {
  try {
    await connectPostgres();
    console.log('✅ PostgreSQL Connected');

    await connectMongoDB();
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    });

    server.listen(SOCKET_PORT, () => {
      console.log(`🔌 WebSocket Server running on http://localhost:${SOCKET_PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
