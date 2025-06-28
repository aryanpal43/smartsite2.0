const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const helmetRoutes = require('./routes/helmets');
const projectRoutes = require('./routes/projects');
const sessionRoutes = require('./routes/sessions');
const videoRoutes = require('./routes/videos');
const analyticsRoutes = require('./routes/analytics');
const apiRoutes = require('./routes/api');

const app = express();
const server = createServer(app);

// CORS configuration for Next.js frontend
const corsOptions = {
  origin: [
    'http://localhost:4028', // Next.js frontend
    'http://localhost:3000', // Fallback
    process.env.FRONTEND_URL || 'http://localhost:4028'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Socket.IO setup with CORS for frontend
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:4028',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:4028'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(limiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    frontend: 'http://localhost:4028'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/helmets', helmetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', apiRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Frontend connected: ${socket.id}`);

  // Join helmet stream room
  socket.on('join-helmet-stream', (helmetId) => {
    socket.join(`helmet-${helmetId}`);
    logger.info(`Frontend ${socket.id} joined helmet stream: ${helmetId}`);
  });

  // Handle video stream from ESP32-CAM
  socket.on('video-stream', (data) => {
    const { helmetId, videoData } = data;
    io.to(`helmet-${helmetId}`).emit('video-feed', videoData);
  });

  // Handle real-time updates for dashboard
  socket.on('subscribe-dashboard', () => {
    socket.join('dashboard-updates');
    logger.info(`Frontend ${socket.id} subscribed to dashboard updates`);
  });

  // Handle real-time updates for helmet status
  socket.on('subscribe-helmets', () => {
    socket.join('helmet-updates');
    logger.info(`Frontend ${socket.id} subscribed to helmet updates`);
  });

  socket.on('disconnect', () => {
    logger.info(`Frontend disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, async () => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('Database connected successfully');
    
    logger.info(`Backend server running on port ${PORT}`);
    logger.info(`Frontend expected on: http://localhost:4028`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app; 