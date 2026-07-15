/**
 * Main Application Entry Point
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const companyRoutes = require('./routes/company.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

// Import database
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for proper IP detection behind load balancers (Vercel, etc.)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// CORS configuration - Dynamic origin support with safe parsing
const getAllowedList = () => {
  const originsEnv = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
  
  if (!originsEnv) {
    // Default allowed origins for development
    return ['http://localhost:3000', 'http://localhost:3001'];
  }
  
  // Split by comma and trim whitespace, filter out empty strings
  return originsEnv.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
};

const allowedOrigins = getAllowedList();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Always allow vercel.app subdomains in production
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting with proper proxy configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use X-Forwarded-For header for IP detection when behind proxy
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'HRIS Payroll API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     HRIS Payroll Enterprise System         ║
║     Backend Server Running                 ║
╚════════════════════════════════════════════╝
  → Environment: ${process.env.NODE_ENV || 'development'}
  → Port: ${PORT}
  → URL: http://localhost:${PORT}
  → Health: http://localhost:${PORT}/health
  `);
});

module.exports = app;
