//entry point aplikasi, disini jalankan server dan cek koneksi database

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

// ============ CEK KONEKSI DATABASE SEBELUM JALANKAN SERVER ============
(async () => {
  try {
    // Query sederhana untuk test koneksi
    const result = await pool.query('SELECT NOW() as current_time');
    console.log(`Database connected at: ${result.rows[0].current_time}`);

    // Jalankan server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1); // Matikan proses jika database gagal
  }
})();