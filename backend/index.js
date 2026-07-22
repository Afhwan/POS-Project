// =============================================
// 1. IMPORT LIBRARY
// =============================================
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// =============================================
// 2. KONEKSI DATABASE
// =============================================
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// =============================================
// 3. SETUP EXPRESS
// =============================================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5500', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// =============================================
// 4. ENDPOINT DEBUG: CEK USER DI DATABASE
// =============================================
app.get('/api/v1/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT username, password_hash FROM users LIMIT 5');
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// 5. ENDPOINT TEST
// =============================================
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// =============================================
// 6. ENDPOINT LOGIN (DENGAN DEBUG ERROR)
// =============================================
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password required',
      });
    }

    // Cari user
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1 AND u.deleted_at IS NULL
    `;
    const userResult = await pool.query(userQuery, [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        debug: 'User not found in database',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled',
      });
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        debug: 'Password hash mismatch',
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Simpan session
    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role_name: user.role_name,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: req.session.user },
    });
  } catch (error) {
    console.error('❌ DETAIL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      debug: error.message, // <-- INI AKAN MENUNJUKKAN PENYEBAB ERROR
      stack: error.stack,   // <-- LIHAT STACK TRACE-NYA
    });
  }
});

// =============================================
// 7. ENDPOINT CEK SESSION
// =============================================
app.get('/api/v1/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }
  res.json({
    success: true,
    data: { user: req.session.user },
  });
});

// =============================================
// 8. ENDPOINT LOGOUT
// =============================================
app.post('/api/v1/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logout successful' });
  });
});

// =============================================
// 9. JALANKAN SERVER
// =============================================
app.listen(PORT, async () => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    console.log(`✅ Database connected: ${result.rows[0].time}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`🐛 Debug users: http://localhost:${PORT}/api/v1/debug/users`);
  } catch (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }
});