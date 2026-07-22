const pool = require('../config/database');

class UserRepository {
  // Cari user berdasarkan username (hanya yang belum dihapus)
  async findByUsername(username) {
    const query = `
      SELECT id, username, password_hash, full_name, role_id, is_active 
      FROM users 
      WHERE username = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Cari user berdasarkan ID
  async findById(id) {
    const query = `
      SELECT id, username, full_name, role_id, is_active 
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update waktu login terakhir
  async updateLastLogin(userId) {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = new UserRepository();