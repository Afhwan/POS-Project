// =============================================
// 1. IMPORT LIBRARY
// =============================================
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

function requireCashierOrAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (!['admin', 'cashier'].includes(req.session.user.role_name)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Cashier or Admin only' });
  }
  next();
}

function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}

function generateRandomToken(length = 24) {
  return crypto.randomBytes(length).toString('hex');
}

async function getCustomerSessionByToken(token) {
  if (!token) return null;
  const result = await pool.query(
    `SELECT cs.id, cs.customer_id, cs.table_id, cs.session_token, cs.status, rt.table_number, rt.status as table_status,
            c.name as customer_name, c.phone_number
       FROM customer_sessions cs
       JOIN customers c ON cs.customer_id = c.id
       JOIN restaurant_tables rt ON cs.table_id = rt.id
      WHERE cs.session_token = $1 AND cs.status = 'ACTIVE'`,
    [token]
  );
  return result.rows[0] || null;
}

async function requireCustomerSession(req, res, next) {
  const token = req.headers['x-customer-session'] || req.headers['X-Customer-Session'];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Customer session token required' });
  }
  try {
    const customerSession = await getCustomerSessionByToken(token);
    if (!customerSession) {
      return res.status(401).json({ success: false, message: 'Invalid or expired customer session' });
    }
    req.customerSession = customerSession;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate customer session', debug: error.message });
  }
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
      debug: error.message,
      stack: error.stack,
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
// 9. CUSTOMER & TABLE API
// =============================================

app.post('/api/v1/customers/login', async (req, res) => {
  try {
    const { name, phone_number, table_token } = req.body;
    if (!name || !phone_number || !table_token) {
      return res.status(400).json({ success: false, message: 'name, phone_number, and table_token are required' });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const tableResult = await pool.query(
      `SELECT rt.id as table_id, rt.table_number, rt.status
       FROM qr_tables qt
       JOIN restaurant_tables rt ON qt.table_id = rt.id
       WHERE qt.qr_token = $1 AND qt.is_active = true AND rt.deleted_at IS NULL`,
      [table_token]
    );
    if (tableResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid table token' });
    }

    const table = tableResult.rows[0];
    const customerResult = await pool.query(
      'SELECT id, name, phone_number, total_visit FROM customers WHERE phone_number = $1 AND deleted_at IS NULL',
      [normalizedPhone]
    );

    let customerId;
    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
      await pool.query(
        `UPDATE customers SET name = $1, total_visit = total_visit + 1, last_visit_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [name, customerId]
      );
    } else {
      const insertCustomer = await pool.query(
        `INSERT INTO customers (name, phone_number, last_visit_at) VALUES ($1, $2, NOW()) RETURNING id`,
        [name, normalizedPhone]
      );
      customerId = insertCustomer.rows[0].id;
    }

    const sessionToken = generateRandomToken(24);
    const sessionResult = await pool.query(
      `INSERT INTO customer_sessions (customer_id, table_id, session_token, started_at, status)
       VALUES ($1, $2, $3, NOW(), 'ACTIVE')
       RETURNING id, session_token`,
      [customerId, table.table_id, sessionToken]
    );

    await pool.query(
      'UPDATE restaurant_tables SET status = $1, updated_at = NOW() WHERE id = $2',
      ['OCCUPIED', table.table_id]
    );

    res.json({
      success: true,
      message: 'Customer session created',
      data: {
        customer_id: customerId,
        session_token: sessionResult.rows[0].session_token,
        table: {
          id: table.table_id,
          number: table.table_number,
          status: 'OCCUPIED',
        },
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer session', debug: error.message });
  }
});

app.get('/api/v1/customers/me', requireCustomerSession, async (req, res) => {
  const customer = {
    id: req.customerSession.customer_id,
    name: req.customerSession.customer_name,
    phone_number: req.customerSession.phone_number,
  };
  res.json({ success: true, data: customer });
});

app.get('/api/v1/customers/me/orders', requireCustomerSession, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.order_number, o.status, COALESCE(SUM(oi.subtotal), 0) as total
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = $1
         AND o.deleted_at IS NULL
       GROUP BY o.id
       ORDER BY o.ordered_at DESC`,
      [req.customerSession.customer_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders', debug: error.message });
  }
});

app.get('/api/v1/tables/qr/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      `SELECT rt.id as table_id, rt.table_number, rt.status
       FROM qr_tables qt
       JOIN restaurant_tables rt ON qt.table_id = rt.id
       WHERE qt.qr_token = $1 AND qt.is_active = true AND rt.deleted_at IS NULL`,
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate QR table', debug: error.message });
  }
});

app.get('/api/v1/tables', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, table_number, capacity, status, location, created_at, updated_at
       FROM restaurant_tables
       WHERE deleted_at IS NULL
       ORDER BY table_number`,
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tables', debug: error.message });
  }
});

app.post('/api/v1/tables', requireAdmin, async (req, res) => {
  try {
    const { table_number, capacity, location } = req.body;
    if (!table_number || !capacity) {
      return res.status(400).json({ success: false, message: 'table_number and capacity are required' });
    }

    const existing = await pool.query(
      'SELECT id FROM restaurant_tables WHERE table_number = $1 AND deleted_at IS NULL',
      [table_number]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Table number already exists' });
    }

    const result = await pool.query(
      `INSERT INTO restaurant_tables (table_number, capacity, location)
       VALUES ($1, $2, $3)
       RETURNING id, table_number, capacity, status, location`,
      [table_number, capacity, location || null]
    );

    const qrToken = generateRandomToken(16);
    await pool.query(
      `INSERT INTO qr_tables (table_id, qr_token, is_active)
       VALUES ($1, $2, true)`,
      [result.rows[0].id, qrToken]
    );

    res.status(201).json({ success: true, message: 'Table created', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create table', debug: error.message });
  }
});

app.patch('/api/v1/tables/:id/status', requireCashierOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }
    const validStatus = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'RESERVED'];
    if (!validStatus.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: `status must be one of ${validStatus.join(', ')}` });
    }
    const result = await pool.query(
      `UPDATE restaurant_tables SET status = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, table_number, status`,
      [status.toUpperCase(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.json({ success: true, message: 'Table status updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update table status', debug: error.message });
  }
});

app.get('/api/v1/customer-session', requireCustomerSession, async (req, res) => {
  res.json({
    success: true,
    data: {
      table: req.customerSession.table_number,
      status: req.customerSession.status,
    },
  });
});

app.post('/api/v1/customer-session/end', requireCustomerSession, async (req, res) => {
  try {
    await pool.query('BEGIN');
    await pool.query(
      `UPDATE customer_sessions
       SET status = 'ENDED', ended_at = NOW()
       WHERE id = $1`,
      [req.customerSession.id]
    );
    await pool.query(
      `UPDATE restaurant_tables
       SET status = 'AVAILABLE', updated_at = NOW()
       WHERE id = $1`,
      [req.customerSession.table_id]
    );
    await pool.query('COMMIT');
    res.json({ success: true, message: 'Customer session ended and table released' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to end customer session', debug: error.message });
  }
});

// =============================================
// 10. CATEGORY MANAGEMENT (ADMIN ONLY)
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
app.get('/api/v1/products', async (req, res) => {
  try {
    const { search, category_id, is_available } = req.query;
    const isAdmin = req.session.user?.role_name === 'admin';
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
    if (!isAdmin && is_available === undefined) {
      conditions.push(`p.is_available = $${idx}`);
      values.push(true);
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
app.get('/api/v1/products/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const isAdmin = req.session.user?.role_name === 'admin';
    let query = `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id AND c.deleted_at IS NULL
       WHERE p.barcode = $1 AND p.deleted_at IS NULL`;
    const values = [barcode];
    if (!isAdmin) {
      query += ' AND p.is_available = true';
    }
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', debug: error.message });
  }
});

// GET product by ID (detail)
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.session.user?.role_name === 'admin';
    let query = `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id AND c.deleted_at IS NULL
       WHERE p.id = $1 AND p.deleted_at IS NULL`;
    const values = [id];
    if (!isAdmin) {
      query += ' AND p.is_available = true';
    }
    const result = await pool.query(query, values);
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

// =============================================
// 11. CART MANAGEMENT (SESSION-BASED)
// =============================================

// Helper: get cart from session
function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
}

// GET cart contents
app.get('/api/v1/cart', requireAuth, async (req, res) => {
  try {
    const cart = getCart(req);
    if (cart.length === 0) {
      return res.json({ success: true, data: [], total: 0 });
    }

    // Get product details for each cart item
    const productIds = cart.map(item => item.product_id);
    const result = await pool.query(
      `SELECT id, name, barcode, price, image_url 
       FROM products 
       WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL`,
      [productIds]
    );
    const products = result.rows;

    // Merge cart quantity with product info
    const cartWithDetails = cart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return null; // product deleted
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price || product.price,
        subtotal: item.quantity * (item.unit_price || product.price),
        product_name: product.name,
        product_barcode: product.barcode,
        product_image: product.image_url,
      };
    }).filter(item => item !== null);

    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ success: true, data: cartWithDetails, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart', debug: error.message });
  }
});

// POST add item to cart
app.post('/api/v1/cart', requireAuth, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'product_id and positive quantity required' });
    }

    // Check product exists and get price
    const productResult = await pool.query(
      'SELECT id, price FROM products WHERE id = $1 AND deleted_at IS NULL AND is_available = true',
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not available' });
    }
    const product = productResult.rows[0];

    const cart = getCart(req);
    const existingItem = cart.find(item => item.product_id === product_id);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.unit_price = parseFloat(product.price);
    } else {
      cart.push({
        product_id: product_id,
        quantity: quantity,
        unit_price: parseFloat(product.price),
      });
    }
    req.session.cart = cart;
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to cart', debug: error.message });
  }
});

// PATCH update item quantity in cart
app.patch('/api/v1/cart/:product_id', requireAuth, async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: 'quantity must be >= 0' });
    }

    const cart = getCart(req);
    const itemIndex = cart.findIndex(item => item.product_id === product_id);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (quantity === 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    req.session.cart = cart;
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart', debug: error.message });
  }
});

// DELETE remove item from cart
app.delete('/api/v1/cart/:product_id', requireAuth, async (req, res) => {
  try {
    const { product_id } = req.params;
    const cart = getCart(req);
    const newCart = cart.filter(item => item.product_id !== product_id);
    if (newCart.length === cart.length) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }
    req.session.cart = newCart;
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item', debug: error.message });
  }
});

// DELETE clear entire cart
app.delete('/api/v1/cart', requireAuth, async (req, res) => {
  req.session.cart = [];
  res.json({ success: true, message: 'Cart cleared' });
});

// =============================================
// 12. ORDER MANAGEMENT
// =============================================

// Helper: generate order number
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

// POST create order from cart
app.post('/api/v1/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, table_id, notes } = req.body;
    const cart = getCart(req);
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let orderCustomerId = customer_id || null;
    let orderSessionId = null;
    let orderTableId = table_id || null;
    const sessionToken = req.headers['x-customer-session'] || req.headers['X-Customer-Session'];
    if (sessionToken) {
      const customerSession = await getCustomerSessionByToken(sessionToken);
      if (!customerSession) {
        return res.status(401).json({ success: false, message: 'Invalid customer session' });
      }
      orderCustomerId = customerSession.customer_id;
      orderSessionId = customerSession.id;
      orderTableId = customerSession.table_id;
    } else {
      if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
    }

    if (!orderCustomerId) {
      const defaultCustomer = await pool.query(
        `SELECT id FROM customers WHERE phone_number = '0000000000' LIMIT 1`
      );
      if (defaultCustomer.rows.length === 0) {
        const customerInsert = await pool.query(
          `INSERT INTO customers (name, phone_number, last_visit_at)
           VALUES ('Walk-in', '0000000000', NOW()) RETURNING id`,
        );
        orderCustomerId = customerInsert.rows[0].id;
      } else {
        orderCustomerId = defaultCustomer.rows[0].id;
      }
    }

    // Get product details and validate stock
    const productIds = cart.map(item => item.product_id);
    const productResult = await pool.query(
      'SELECT id, price, is_available FROM products WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL',
      [productIds]
    );
    if (productResult.rows.length !== cart.length) {
      return res.status(400).json({ success: false, message: 'Some products are unavailable or deleted' });
    }
    const unavailable = productResult.rows.filter(p => !p.is_available);
    if (unavailable.length > 0) {
      return res.status(400).json({ success: false, message: 'Some products are not available' });
    }
    const productMap = {};
    productResult.rows.forEach(p => { productMap[p.id] = parseFloat(p.price); });

    // Begin transaction
    await client.query('BEGIN');

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, table_id, notes, session_id, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING id, order_number, status, ordered_at`,
      [orderNumber, orderCustomerId, orderTableId, notes || null, orderSessionId]
    );
    const order = orderResult.rows[0];

    // Insert order items
    const orderItems = [];
    for (const item of cart) {
      const price = productMap[item.product_id];
      const subtotal = item.quantity * price;
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, product_id, quantity, unit_price, subtotal`,
        [order.id, item.product_id, item.quantity, price, subtotal]
      );
      orderItems.push(itemResult.rows[0]);
    }

    // Commit transaction
    await client.query('COMMIT');

    // Clear cart after successful order creation
    req.session.cart = [];

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        items: orderItems,
        total: orderItems.reduce((sum, i) => sum + parseFloat(i.subtotal), 0),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', debug: error.message });
  } finally {
    client.release();
  }
});

// GET list orders with filters
app.get('/api/v1/orders', requireAuth, async (req, res) => {
  try {
    const { status, start_date, end_date, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT o.id, o.order_number, o.status, o.ordered_at, o.completed_at,
             o.customer_id, o.table_id, o.notes,
             COUNT(oi.id) as item_count,
             COALESCE(SUM(oi.subtotal), 0) as total_amount
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.deleted_at IS NULL
    `;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.status = $${idx++}`);
      values.push(status.toUpperCase());
    }
    if (start_date) {
      conditions.push(`o.ordered_at >= $${idx++}`);
      values.push(start_date);
    }
    if (end_date) {
      conditions.push(`o.ordered_at <= $${idx++}`);
      values.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` GROUP BY o.id ORDER BY o.ordered_at DESC LIMIT $${idx} OFFSET $${idx+1}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows, pagination: { limit, offset } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', debug: error.message });
  }
});

// GET order detail by ID
app.get('/api/v1/orders/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.*, 
              COUNT(oi.id) as item_count,
              COALESCE(SUM(oi.subtotal), 0) as total_amount
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.deleted_at IS NULL
       GROUP BY o.id`,
      [id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const order = orderResult.rows[0];

    // Get items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name, p.barcode
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );
    order.items = itemsResult.rows;

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', debug: error.message });
  }
});

// PATCH update order status
app.patch('/api/v1/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, payment_amount } = req.body;
    const allowedStatus = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];
    if (!status || !allowedStatus.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid status. Allowed: PENDING, PAID, COMPLETED, CANCELLED' });
    }

    const newStatus = status.toUpperCase();

    // Check order exists and current status
    const checkResult = await pool.query(
      'SELECT id, status, order_number FROM orders WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const currentStatus = checkResult.rows[0].status;
    const orderNumber = checkResult.rows[0].order_number;

    // Validation: cannot change if already CANCELLED or COMPLETED
    if (['CANCELLED', 'COMPLETED'].includes(currentStatus) && currentStatus !== newStatus) {
      return res.status(400).json({ success: false, message: `Cannot update a ${currentStatus} order` });
    }

    // If updating to COMPLETED, set completed_at
    let completedAt = null;
    if (newStatus === 'COMPLETED') {
      completedAt = 'NOW()';
    }

    const shouldProcessPayment = newStatus === 'PAID' && !['PAID', 'COMPLETED'].includes(currentStatus);
    let result;

    if (shouldProcessPayment) {
      const client2 = await pool.connect();
      try {
        await client2.query('BEGIN');

        const updateOrder = await client2.query(
          `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, order_number, completed_at`,
          [newStatus, id]
        );
        if (updateOrder.rows.length === 0) {
          throw new Error('Order not found');
        }
        result = updateOrder;

        // 1. Dapatkan data order dan customer
        const orderData = await client2.query(
          `SELECT o.id, o.customer_id
           FROM orders o
           WHERE o.id = $1`,
          [id]
        );
        const order = orderData.rows[0];
        if (!order) throw new Error('Order not found');

        let customerId = order.customer_id;
        if (!customerId) {
          const defaultCustomer = await client2.query(
            `SELECT id FROM customers WHERE phone_number = '0000000000' LIMIT 1`
          );
          if (defaultCustomer.rows.length === 0) {
            const newCustomer = await client2.query(
              `INSERT INTO customers (id, name, phone_number, created_at, updated_at)
               VALUES (uuid_generate_v4(), 'Walk-in', '0000000000', NOW(), NOW())
               RETURNING id`
            );
            customerId = newCustomer.rows[0].id;
          } else {
            customerId = defaultCustomer.rows[0].id;
          }
        }

        // 2. Dapatkan order items & hitung total
        const itemsResult = await client2.query(
          `SELECT product_id, quantity, subtotal
           FROM order_items
           WHERE order_id = $1`,
          [id]
        );
        const subtotal = itemsResult.rows.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
        const tax = 0;
        const discount = 0;
        const total = subtotal + tax - discount;

        // 3. Kurangi stok untuk setiap produk dalam order
        for (const item of itemsResult.rows) {
          await adjustInventoryStock(
            item.product_id,
            -item.quantity,
            id,
            'order',
            'SALE',
            req.session.user.id,
            client2
          );
        }

        // 4. Generate transaction number
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
                        String(now.getMonth()+1).padStart(2,'0') +
                        String(now.getDate()).padStart(2,'0');
        const random = Math.floor(Math.random()*10000).toString().padStart(4,'0');
        const transactionNumber = `TRX-${dateStr}-${random}`;

        // 5. Insert transaction
        const insertTrx = await client2.query(
          `INSERT INTO transactions
           (order_id, customer_id, transaction_number,
            subtotal, tax_amount, discount_amount, total_amount, status, transaction_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PAID', NOW())
           RETURNING id`,
          [id, customerId, transactionNumber, subtotal, tax, discount, total]
        );
        const transactionId = insertTrx.rows[0].id;

        // 6. Insert payment record
        const payMethod = payment_method || 'UNKNOWN';
        const payAmount = payment_amount || total;
        await client2.query(
          `INSERT INTO payments
           (transaction_id, method, amount, status, paid_at)
           VALUES ($1, $2, $3, 'SUCCESS', NOW())`,
          [transactionId, payMethod, payAmount]
        );

        await client2.query('COMMIT');
      } catch (err) {
        await client2.query('ROLLBACK');
        throw err;
      } finally {
        client2.release();
      }
    } else {
      const updateResult = await pool.query(query, values);
      result = updateResult;
    }

    res.json({ success: true, message: 'Order status updated', data: result.rows[0] });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', debug: error.message });
  }
});

// DELETE order (only if PENDING)
app.delete('/api/v1/orders/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await pool.query(
      'SELECT id, status FROM orders WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (checkResult.rows[0].status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Only PENDING orders can be deleted' });
    }

    // Soft delete order (cascade? We'll keep order_items but mark order deleted)
    await pool.query('UPDATE orders SET deleted_at = NOW() WHERE id = $1', [id]);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order', debug: error.message });
  }
});

async function createTransactionFromOrder(orderId, client) {
  const orderResult = await client.query(
    `SELECT o.id, o.customer_id, o.status, o.order_number, o.table_id
     FROM orders o
     WHERE o.id = $1 AND o.deleted_at IS NULL`,
    [orderId]
  );
  if (orderResult.rows.length === 0) {
    throw new Error('Order not found');
  }
  const order = orderResult.rows[0];
  if (order.status === 'CANCELLED') {
    throw new Error('Cannot create transaction from cancelled order');
  }

  const existingTransaction = await client.query(
    'SELECT id FROM transactions WHERE order_id = $1',
    [orderId]
  );
  if (existingTransaction.rows.length > 0) {
    throw new Error('Transaction already exists for this order');
  }

  const itemsResult = await client.query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, oi.subtotal, p.name as product_name
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  if (itemsResult.rows.length === 0) {
    throw new Error('Order has no items');
  }

  const subtotal = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const now = new Date();
  const dateStr = now.getFullYear().toString() +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const transactionNumber = `TRX-${dateStr}-${random}`;

  const transactionResult = await client.query(
    `INSERT INTO transactions
     (order_id, customer_id, transaction_number, subtotal, tax_amount, discount_amount, total_amount, status, transaction_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id, transaction_number, total_amount, status`,
    [orderId, order.customer_id, transactionNumber, subtotal, tax, discount, total, order.status === 'PAID' ? 'PAID' : 'PENDING']
  );

  const transaction = transactionResult.rows[0];
  for (const item of itemsResult.rows) {
    await client.query(
      `INSERT INTO transaction_items
       (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [transaction.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.subtotal]
    );
  }

  return transaction;
}

async function processTransactionPayment(transactionId, method, amount, status, referenceNumber, userId, client) {
  const transactionResult = await client.query(
    `SELECT t.id, t.order_id, t.total_amount, t.status as transaction_status, o.status as order_status
     FROM transactions t
     JOIN orders o ON o.id = t.order_id
     WHERE t.id = $1`,
    [transactionId]
  );
  if (transactionResult.rows.length === 0) {
    throw new Error('Transaction not found');
  }
  const transaction = transactionResult.rows[0];

  if (transaction.transaction_status === 'PAID') {
    throw new Error('Transaction already paid');
  }

  const expectedAmount = parseFloat(transaction.total_amount);
  if (status === 'SUCCESS' && parseFloat(amount) !== expectedAmount) {
    throw new Error('Payment amount does not match transaction total');
  }

  const insertQuery = `INSERT INTO payments (transaction_id, method, amount, status, reference_number, paid_at)
       VALUES ($1, $2, $3, $4, $5, ${status === 'SUCCESS' ? 'NOW()' : 'NULL'})
       RETURNING id, status, method, amount`;
  const result = await client.query(insertQuery, [transactionId, method, amount, status, referenceNumber || null]);

  if (status === 'SUCCESS') {
    await client.query(
      `UPDATE transactions SET status = 'PAID', updated_at = NOW() WHERE id = $1`,
      [transactionId]
    );
    if (!['PAID', 'COMPLETED'].includes(transaction.order_status)) {
      await client.query(
        `UPDATE orders SET status = 'PAID', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [transaction.order_id]
      );
    }

    const orderItems = await client.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [transaction.order_id]
    );
    for (const item of orderItems.rows) {
      await adjustInventoryStock(
        item.product_id,
        -item.quantity,
        transactionId,
        'transaction',
        'SALE',
        userId,
        client
      );
    }
  }

  return result.rows[0];
}

async function finalizePaidTransaction(transactionId, userId, client) {
  const transactionResult = await client.query(
    `SELECT t.id, t.order_id, t.status as transaction_status, o.status as order_status
     FROM transactions t
     JOIN orders o ON o.id = t.order_id
     WHERE t.id = $1`,
    [transactionId]
  );
  if (transactionResult.rows.length === 0) {
    throw new Error('Transaction not found');
  }
  const transaction = transactionResult.rows[0];
  if (transaction.transaction_status === 'PAID') {
    return;
  }

  await client.query(
    `UPDATE transactions SET status = 'PAID', updated_at = NOW() WHERE id = $1`,
    [transactionId]
  );
  if (!['PAID', 'COMPLETED'].includes(transaction.order_status)) {
    await client.query(
      `UPDATE orders SET status = 'PAID', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [transaction.order_id]
    );
  }

  const orderItems = await client.query(
    `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
    [transaction.order_id]
  );
  for (const item of orderItems.rows) {
    await adjustInventoryStock(
      item.product_id,
      -item.quantity,
      transactionId,
      'transaction',
      'SALE',
      userId,
      client
    );
  }
}

app.post('/api/v1/transactions', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    await client.query('BEGIN');
    const transaction = await createTransactionFromOrder(order_id, client);
    await client.query('COMMIT');

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to create transaction', debug: error.message });
  } finally {
    client.release();
  }
});

app.get('/api/v1/transactions', requireCashierOrAdmin, async (req, res) => {
  try {
    const { date, status, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (date) {
      conditions.push(`DATE(t.transaction_date) = $${idx++}`);
      values.push(date);
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(status.toUpperCase());
    }

    const query = `
      SELECT t.id, t.transaction_number, t.total_amount, t.status, t.transaction_date
      FROM transactions t
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.transaction_date DESC
      LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows, pagination: { limit, offset } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', debug: error.message });
  }
});

app.get('/api/v1/transactions/:id', requireCashierOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const transactionResult = await pool.query(
      `SELECT t.*, o.order_number, c.name as customer_name, c.phone_number
       FROM transactions t
       JOIN orders o ON o.id = t.order_id
       JOIN customers c ON c.id = t.customer_id
       WHERE t.id = $1`,
      [id]
    );
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    const transaction = transactionResult.rows[0];
    const itemsResult = await pool.query(
      `SELECT * FROM transaction_items WHERE transaction_id = $1`,
      [id]
    );
    const paymentsResult = await pool.query(
      `SELECT * FROM payments WHERE transaction_id = $1`,
      [id]
    );
    res.json({ success: true, data: { ...transaction, items: itemsResult.rows, payments: paymentsResult.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transaction detail', debug: error.message });
  }
});

app.get('/api/v1/transactions/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT transaction_number FROM transactions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: { receipt_url: `/files/receipt/${result.rows[0].transaction_number}.pdf` } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate receipt', debug: error.message });
  }
});

app.post('/api/v1/transactions/:id/refund', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'reason is required' });
    }

    await client.query('BEGIN');
    const transactionResult = await client.query(
      `SELECT t.id, t.order_id, t.status, o.status AS order_status
       FROM transactions t
       JOIN orders o ON o.id = t.order_id
       WHERE t.id = $1`,
      [id]
    );
    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const transaction = transactionResult.rows[0];
    if (transaction.status !== 'PAID') {
      throw new Error('Only paid transactions can be refunded');
    }

    await client.query(
      `UPDATE transactions SET status = 'REFUNDED', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query(
      `UPDATE orders SET status = 'REFUNDED', updated_at = NOW() WHERE id = $1`,
      [transaction.order_id]
    );
    await client.query(
      `UPDATE payments SET status = 'REFUNDED', updated_at = NOW() WHERE transaction_id = $1`,
      [id]
    );

    const orderItems = await client.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [transaction.order_id]
    );
    for (const item of orderItems.rows) {
      await adjustInventoryStock(
        item.product_id,
        item.quantity,
        id,
        'refund',
        'RESTOCK',
        req.session.user ? req.session.user.id : null,
        client
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Transaction refunded' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to refund transaction', debug: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/payments', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id, method, amount } = req.body;
    if (!transaction_id || !method || amount === undefined) {
      return res.status(400).json({ success: false, message: 'transaction_id, method, and amount are required' });
    }
    await client.query('BEGIN');
    const payment = await processTransactionPayment(
      transaction_id,
      method.toUpperCase(),
      amount,
      'SUCCESS',
      null,
      req.session.user.id,
      client
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Payment successful', data: payment });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to process payment', debug: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/payments/qris', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }
    await client.query('BEGIN');
    const transactionResult = await client.query('SELECT total_amount FROM transactions WHERE id = $1', [transaction_id]);
    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const payment = await processTransactionPayment(
      transaction_id,
      'QRIS',
      parseFloat(transactionResult.rows[0].total_amount),
      'WAITING',
      `QRIS-${generateRandomToken(8)}`,
      req.session.user.id,
      client
    );
    await client.query('COMMIT');
    res.json({ success: true, data: { qr_code: 'dummy-qris-image', status: payment.status } });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to create QRIS payment', debug: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/payments/debit', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }
    await client.query('BEGIN');
    const transactionResult = await client.query('SELECT total_amount FROM transactions WHERE id = $1', [transaction_id]);
    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const payment = await processTransactionPayment(
      transaction_id,
      'DEBIT',
      parseFloat(transactionResult.rows[0].total_amount),
      'SUCCESS',
      null,
      req.session.user.id,
      client
    );
    await client.query('COMMIT');
    res.json({ success: true, status: payment.status });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to process debit payment', debug: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/payments/transfer', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }
    await client.query('BEGIN');
    const transactionResult = await client.query('SELECT total_amount FROM transactions WHERE id = $1', [transaction_id]);
    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    const payment = await processTransactionPayment(
      transaction_id,
      'TRANSFER',
      parseFloat(transactionResult.rows[0].total_amount),
      'SUCCESS',
      null,
      req.session.user.id,
      client
    );
    await client.query('COMMIT');
    res.json({ success: true, status: payment.status });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to process transfer payment', debug: error.message });
  } finally {
    client.release();
  }
});

app.post('/api/v1/payments/:id/confirm', requireCashierOrAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    const paymentResult = await client.query('SELECT transaction_id, status, method, amount FROM payments WHERE id = $1', [id]);
    if (paymentResult.rows.length === 0) {
      throw new Error('Payment not found');
    }
    const payment = paymentResult.rows[0];
    if (payment.status !== 'WAITING') {
      throw new Error('Only WAITING payments can be confirmed');
    }
    await client.query(
      `UPDATE payments SET status = 'SUCCESS', paid_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await finalizePaidTransaction(payment.transaction_id, req.session.user.id, client);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Payment successful' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to confirm payment', debug: error.message });
  } finally {
    client.release();
  }
});

app.patch('/api/v1/payments/:id/cancel', requireCashierOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentResult = await pool.query('SELECT id, status FROM payments WHERE id = $1', [id]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (paymentResult.rows[0].status !== 'WAITING') {
      return res.status(400).json({ success: false, message: 'Only WAITING payments can be cancelled' });
    }
    await pool.query("UPDATE payments SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1", [id]);
    res.json({ success: true, message: 'Payment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel payment', debug: error.message });
  }
});

app.get('/api/v1/suppliers', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone_number, email, address, is_active, created_at, updated_at
       FROM suppliers
       WHERE deleted_at IS NULL
       ORDER BY name`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', debug: error.message });
  }
});

app.post('/api/v1/suppliers', requireAdmin, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    const result = await pool.query(
      `INSERT INTO suppliers (name, phone_number, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone_number, email, address`,
      [name, phone || null, email || null, address || null]
    );
    res.status(201).json({ success: true, message: 'Supplier created', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create supplier', debug: error.message });
  }
});

app.patch('/api/v1/suppliers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, is_active } = req.body;
    const checkResult = await pool.query('SELECT id FROM suppliers WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const updates = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
    if (phone !== undefined) { updates.push(`phone_number = $${idx++}`); values.push(phone); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); values.push(email); }
    if (address !== undefined) { updates.push(`address = $${idx++}`); values.push(address); }
    if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    values.push(id);
    const result = await pool.query(
      `UPDATE suppliers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, name, phone_number, email, address, is_active`,
      values
    );
    res.json({ success: true, message: 'Supplier updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update supplier', debug: error.message });
  }
});

app.delete('/api/v1/suppliers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const checkResult = await pool.query('SELECT id FROM suppliers WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    await pool.query('UPDATE suppliers SET deleted_at = NOW() WHERE id = $1', [id]);
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete supplier', debug: error.message });
  }
});

// =============================================
// 13. INVENTORY & STOCK MOVEMENT
// =============================================

// Helper: update inventory and record stock history
async function adjustInventoryStock(productId, quantityChange, referenceId, referenceType, changeType, userId, client) {
    const inventoryResult = await client.query(
        'SELECT id, current_stock FROM inventory WHERE product_id = $1 FOR UPDATE',
        [productId]
    );
    let inventoryId;
    let previousStock;
    let newStock;

    if (inventoryResult.rows.length === 0) {
        if (quantityChange < 0) {
            throw new Error('Inventory record not found for product');
        }

        previousStock = 0;
        newStock = quantityChange;
        const insertResult = await client.query(
            'INSERT INTO inventory (product_id, current_stock, min_stock, updated_at) VALUES ($1, $2, 0, NOW()) RETURNING id',
            [productId, newStock]
        );
        inventoryId = insertResult.rows[0].id;
    } else {
        inventoryId = inventoryResult.rows[0].id;
        previousStock = parseInt(inventoryResult.rows[0].current_stock, 10);
        newStock = previousStock + quantityChange;
    }

    if (newStock < 0) {
        throw new Error('Stock cannot be negative');
    }

    await client.query(
        'UPDATE inventory SET current_stock = $1, updated_at = NOW() WHERE id = $2',
        [newStock, inventoryId]
    );

    await client.query(
        `INSERT INTO inventory_history
         (inventory_id, product_id, change_type, quantity_change, previous_stock, new_stock, reference_type, reference_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [inventoryId, productId, changeType, quantityChange, previousStock, newStock, referenceType, referenceId, userId]
    );

    return newStock;
}

// PATCH update stock manually (admin only)
app.patch('/api/v1/products/:id/stock', requireAdmin, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ success: false, message: 'quantity is required' });
        }

        // Product must exist
        const productCheck = await client.query(
            'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await client.query('BEGIN');
        const newStock = await adjustInventoryStock(
            id,
            Number(quantity),
            null,
            'manual',
            'ADJUST',
            req.session.user.id,
            client
        );
        await client.query('COMMIT');

        res.json({ success: true, message: 'Stock updated', data: { product_id: id, new_stock: newStock } });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Failed to update stock', debug: error.message });
    } finally {
        client.release();
    }
});

// GET stock movements for a product
app.get('/api/v1/products/:id/stock-movements', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT ih.*, u.username as created_by_username
             FROM inventory_history ih
             LEFT JOIN users u ON ih.created_by = u.id
             WHERE ih.product_id = $1
             ORDER BY ih.created_at DESC
             LIMIT $2 OFFSET $3`,
            [id, parseInt(limit, 10), parseInt(offset, 10)]
        );

        res.json({ success: true, data: result.rows, pagination: { limit, offset } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch stock movements', debug: error.message });
    }
});

// =============================================
// 14. REPORTS & ANALYTICS
// =============================================

// Helper: validasi tanggal
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// GET sales report with date filter
app.get('/api/v1/reports/sales', requireAdmin, async (req, res) => {
    try {
        const { start_date, end_date, interval = 'day' } = req.query;
        
        // Default: 7 hari terakhir
        let start = start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let end = end_date || new Date().toISOString().split('T')[0];
        
        if (!isValidDate(start) || !isValidDate(end)) {
            return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
        }
        
        if (start > end) {
            return res.status(400).json({ success: false, message: 'start_date must be before or equal to end_date' });
        }
        
        // Aggregasi per interval (day, month, year)
        let dateTrunc;
        switch (interval) {
            case 'month': dateTrunc = 'month'; break;
            case 'year': dateTrunc = 'year'; break;
            default: dateTrunc = 'day';
        }
        
        const query = `
            SELECT 
                DATE_TRUNC($1, o.ordered_at) as period,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(oi.subtotal), 0) as total_revenue,
                COALESCE(AVG(oi.subtotal), 0) as average_order_value,
                COUNT(oi.id) as total_items_sold
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status IN ('PAID', 'COMPLETED')
                AND o.ordered_at >= $2::date
                AND o.ordered_at <= $3::date
                AND o.deleted_at IS NULL
            GROUP BY period
            ORDER BY period ASC
        `;
        
        const result = await pool.query(query, [dateTrunc, start, end]);
        
        // Hitung total keseluruhan
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(oi.subtotal), 0) as total_revenue,
                COALESCE(AVG(oi.subtotal), 0) as average_order_value,
                COUNT(oi.id) as total_items_sold
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status IN ('PAID', 'COMPLETED')
                AND o.ordered_at >= $1::date
                AND o.ordered_at <= $2::date
                AND o.deleted_at IS NULL
        `;
        const summaryResult = await pool.query(summaryQuery, [start, end]);
        
        res.json({
            success: true,
            data: {
                period: result.rows,
                summary: summaryResult.rows[0],
                filters: { start_date: start, end_date: end, interval }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate sales report', debug: error.message });
    }
});

// GET top products (by quantity or revenue)
app.get('/api/v1/reports/top-products', requireAdmin, async (req, res) => {
    try {
        const { limit = 10, sort_by = 'quantity' } = req.query;
        const validSort = ['quantity', 'revenue'];
        if (!validSort.includes(sort_by)) {
            return res.status(400).json({ success: false, message: 'sort_by must be "quantity" or "revenue"' });
        }
        
        let orderBy;
        let selectField;
        if (sort_by === 'quantity') {
            orderBy = 'total_quantity DESC';
            selectField = 'SUM(oi.quantity) as total_quantity';
        } else {
            orderBy = 'total_revenue DESC';
            selectField = 'COALESCE(SUM(oi.subtotal), 0) as total_revenue';
        }
        
        const query = `
            SELECT 
                p.id,
                p.name,
                p.barcode,
                p.price,
                COUNT(DISTINCT o.id) as order_count,
                ${selectField},
                COALESCE(SUM(oi.subtotal), 0) as revenue
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status IN ('PAID', 'COMPLETED')
                AND o.deleted_at IS NULL
            GROUP BY p.id, p.name, p.barcode, p.price
            ORDER BY ${orderBy}
            LIMIT $1
        `;
        
        const result = await pool.query(query, [parseInt(limit)]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch top products', debug: error.message });
    }
});

// GET stock status (low stock & out of stock)
app.get('/api/v1/reports/stock-status', requireAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.barcode,
                p.price,
                i.current_stock as stock,
                i.min_stock,
                CASE 
                    WHEN i.current_stock <= 0 THEN 'OUT OF STOCK'
                    WHEN i.current_stock <= i.min_stock THEN 'LOW STOCK'
                    ELSE 'OK'
                END as status
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            WHERE p.deleted_at IS NULL
                AND (i.current_stock <= i.min_stock OR i.current_stock <= 0)
            ORDER BY i.current_stock ASC
        `;
        
        const result = await pool.query(query);
        
        // Summary
        const outOfStock = result.rows.filter(r => r.status === 'OUT OF STOCK').length;
        const lowStock = result.rows.filter(r => r.status === 'LOW STOCK').length;
        
        res.json({
            success: true,
            data: {
                products: result.rows,
                summary: {
                    total_products: result.rows.length,
                    out_of_stock: outOfStock,
                    low_stock: lowStock
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch stock status', debug: error.message });
    }
});

// GET payment report (from payments table)
app.get('/api/v1/reports/payments', requireAdmin, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT 
                p.method as payment_method,
                COUNT(DISTINCT t.id) as total_transactions,
                COALESCE(SUM(p.amount), 0) as total_sales
            FROM payments p
            JOIN transactions t ON p.transaction_id = t.id
            WHERE t.status = 'PAID'
        `;
        const values = [];
        let idx = 1;
        if (start_date) {
            query += ` AND p.paid_at >= $${idx++}`;
            values.push(start_date);
        }
        if (end_date) {
            query += ` AND p.paid_at <= $${idx++}`;
            values.push(end_date);
        }
        query += ` GROUP BY p.method ORDER BY total_sales DESC`;

        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch payment report', debug: error.message });
    }
});

// =============================================
// 15. JALANKAN SERVER
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