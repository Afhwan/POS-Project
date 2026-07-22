const authService = require('../services/authService');

class AuthController {
  // Login
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // Validasi sederhana: username dan password wajib diisi
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
      }

      // Panggil service
      const user = await authService.login(username, password);

      // Simpan data user ke session
      req.session.user = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name,
      };

      // Kirim response
      res.json({
        success: true,
        message: 'Login successful',
        data: { user: req.session.user },
      });
    } catch (error) {
      // Error akan ditangani oleh error middleware
      next(error);
    }
  }

  // Logout
  logout(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      // Hapus cookie session
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logout successful',
      });
    });
  }

  // Mendapatkan data user yang sedang login
  me(req, res) {
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
  }

  // Cek apakah session valid
  sessionCheck(req, res) {
    const authenticated = !!req.session.user;
    res.json({
      success: true,
      data: { authenticated },
    });
  }
}

module.exports = new AuthController();