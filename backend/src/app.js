const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// ============ MIDDLEWARE GLOBAL ============
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 hari
  },
}));

// ============ ROUTES ============
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Register routes authentication
app.use('/api/v1/auth', authRoutes);

// ============ ERROR HANDLER (harus paling akhir) ============
app.use(errorHandler);

module.exports = app;