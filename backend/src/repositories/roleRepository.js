const pool = require('../config/database');

class RoleRepository {
  // Ambil nama role berdasarkan ID
  async findById(id) {
    const query = 'SELECT name FROM roles WHERE id = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new RoleRepository();