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
// 4. MIDDLEWARE AUTH & ADMIN
// =============================================
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.session.user.role_name !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
  }
  next();
}

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
// 9. CATEGORY MANAGEMENT (ADMIN ONLY)
// =============================================

// GET all categories
app.get('/api/v1/categories', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM categories WHERE deleted_at IS NULL ORDER BY name'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', debug: error.message });
  }
});

// POST create category
app.post('/api/v1/categories', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Check duplicate
    const existing = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND deleted_at IS NULL',
      [name]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id, name, description',
      [name, description]
    );
    res.status(201).json({ success: true, message: 'Category created', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category', debug: error.message });
  }
});

// PATCH update category
app.patch('/api/v1/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const check = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (name) {
      // Check duplicate name if changed
      const dup = await pool.query(
        'SELECT id FROM categories WHERE name = $1 AND id != $2 AND deleted_at IS NULL',
        [name, id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Category name already exists' });
      }
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE categories 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, description
    `;
    const result = await pool.query(query, values);
    res.json({ success: true, message: 'Category updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category', debug: error.message });
  }
});

// DELETE category (soft delete)
app.delete('/api/v1/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Optional: check if category has products
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE category_id = $1 AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    if (productCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with existing products' });
    }

    await pool.query('UPDATE categories SET deleted_at = NOW() WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category', debug: error.message });
  }
});

// =============================================
// 10. PRODUCT MANAGEMENT (ADMIN ONLY)
// =============================================

// GET products with optional search/filter
app.get('/api/v1/products', requireAdmin, async (req, res) => {
  try {
    const { search, category_id, is_available } = req.query;
    let query = `
      SELECT p.id, p.name, p.barcode, p.sku, p.price, p.cost_price,
             p.description, p.image_url, p.is_available,
             p.created_at, p.updated_at,
             c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id AND c.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
    `;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.barcode ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (category_id) {
      conditions.push(`p.category_id = $${idx}`);
      values.push(category_id);
      idx++;
    }
    if (is_available !== undefined) {
      conditions.push(`p.is_available = $${idx}`);
      values.push(is_available === 'true');
      idx++;
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.name ASC';

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', debug: error.message });
  }
});

// GET product by barcode
app.get('/api/v1/products/barcode/:barcode', requireAdmin, async (req, res) => {
  try {
    const { barcode } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id AND c.deleted_at IS NULL
       WHERE p.barcode = $1 AND p.deleted_at IS NULL`,
      [barcode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', debug: error.message });
  }
});

// GET product by ID (detail)
app.get('/api/v1/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id AND c.deleted_at IS NULL
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', debug: error.message });
  }
});

// POST create product
app.post('/api/v1/products', requireAdmin, async (req, res) => {
  try {
    const {
      name, barcode, sku, category_id,
      price, cost_price, description, image_url, is_available
    } = req.body;

    // Validation
    if (!name || !barcode || !category_id || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, barcode, category_id, and price are required'
      });
    }

    // Check duplicate barcode
    const existing = await pool.query(
      'SELECT id FROM products WHERE barcode = $1 AND deleted_at IS NULL',
      [barcode]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Barcode already exists' });
    }

    // Check category exists
    const catCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND deleted_at IS NULL',
      [category_id]
    );
    if (catCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    const result = await pool.query(
      `INSERT INTO products 
       (name, barcode, sku, category_id, price, cost_price, description, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, barcode, sku, price, is_available`,
      [
        name, barcode, sku || null, category_id,
        price, cost_price || null, description || null,
        image_url || null, is_available !== undefined ? is_available : true
      ]
    );
    res.status(201).json({ success: true, message: 'Product created', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product', debug: error.message });
  }
});

// PATCH update product
app.patch('/api/v1/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, barcode, sku, category_id,
      price, cost_price, description, image_url, is_available
    } = req.body;

    // Check product exists
    const check = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (name) { updates.push(`name = $${idx++}`); values.push(name); }
    if (barcode) {
      // Check duplicate if changed
      const dup = await pool.query(
        'SELECT id FROM products WHERE barcode = $1 AND id != $2 AND deleted_at IS NULL',
        [barcode, id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Barcode already exists' });
      }
      updates.push(`barcode = $${idx++}`); values.push(barcode);
    }
    if (sku !== undefined) { updates.push(`sku = $${idx++}`); values.push(sku || null); }
    if (category_id) {
      const catCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND deleted_at IS NULL',
        [category_id]
      );
      if (catCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
      updates.push(`category_id = $${idx++}`); values.push(category_id);
    }
    if (price !== undefined) { updates.push(`price = $${idx++}`); values.push(price); }
    if (cost_price !== undefined) { updates.push(`cost_price = $${idx++}`); values.push(cost_price); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (image_url !== undefined) { updates.push(`image_url = $${idx++}`); values.push(image_url); }
    if (is_available !== undefined) { updates.push(`is_available = $${idx++}`); values.push(is_available); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE products 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, barcode, sku, price, is_available
    `;
    const result = await pool.query(query, values);
    res.json({ success: true, message: 'Product updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product', debug: error.message });
  }
});

// DELETE product (soft delete)
app.delete('/api/v1/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await pool.query('UPDATE products SET deleted_at = NOW() WHERE id = $1', [id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', debug: error.message });
  }
});


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