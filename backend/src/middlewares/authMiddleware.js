// Middleware untuk memastikan user sudah login
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error_code: 'UNAUTHORIZED',
    });
  }
  next();
}

// Middleware untuk memastikan user memiliki role tertentu
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    // Cek apakah role user ada di daftar yang diizinkan
    if (!roles.includes(req.session.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient role',
        error_code: 'FORBIDDEN',
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };