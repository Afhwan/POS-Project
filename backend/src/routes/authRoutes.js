const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Endpoint login (public)
router.post('/login', authController.login);

// Endpoint logout (harus login dulu)
router.post('/logout', authController.logout);

// Endpoint cek user yang sedang login
router.get('/me', authController.me);

// Endpoint cek apakah session masih valid
router.get('/session', authController.sessionCheck);

module.exports = router;