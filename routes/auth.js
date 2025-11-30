const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', signup);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/me - GET CURRENT USER
router.get('/me', protect, async (req, res) => {
  try {
    const user = await require('../models/user').findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
