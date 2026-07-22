function errorHandler(err, req, res, next) {
  // Tampilkan error di console untuk debugging
  console.error('Error:', err.message);
  console.error(err.stack);

  // Kirim response ke client
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error_code: err.code || 'SERVER_ERROR',
  });
}

module.exports = errorHandler;