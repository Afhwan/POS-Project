//inti aplikasi  inti express. disini pasang semua middleware dan route dasar

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============ MIDDLEWARE GLOBAL ============

// 1. Keamanan: tambahkan header HTTP seperti X-Content-Type-Options, dll.
app.use(helmet());

// 2. CORS: izinkan frontend (nanti kita set origin-nya)
app.use(cors({
  origin: 'http://localhost:5500', // default untuk Live Server VS Code
  credentials: true, // izinkan kirim cookie
}));

// 3. Parse JSON body dari request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Session Management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,            // jangan simpan ulang session kalau tidak berubah
  saveUninitialized: false, // jangan buat session kosong
  cookie: {
    httpOnly: true,         // tidak bisa diakses oleh JavaScript di browser
    secure: process.env.NODE_ENV === 'production', // hanya kirim via HTTPS di production
    sameSite: 'strict',     // perlindungan CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 hari (dalam milidetik)
  },
}));

// ============ ROUTE PERTAMA (TEST) ============

// Endpoint untuk mengecek apakah server hidup
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============ ERROR HANDLER (sementara) ============
// Nanti kita akan buat lebih lengkap
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;