const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));

// Logging middleware
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dahill Invoice API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Dahill Invoice API server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (config.nodeEnv === 'development') {
    console.log(`📖 API Documentation:`);
    console.log(`   Auth: http://localhost:${PORT}/api/auth`);
    console.log(`   Customers: http://localhost:${PORT}/api/customers`);
    console.log(`   Invoices: http://localhost:${PORT}/api/invoices`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
