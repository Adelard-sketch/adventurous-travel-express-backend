const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking
} = require('../controllers/bookings');

// @route   GET /api/bookings
// @desc    Get all bookings for logged in user
router.get('/', protect, getBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking
router.get('/:id', protect, getBooking);

// @route   POST /api/bookings
// @desc    Create new booking
router.post('/', protect, createBooking);

// @route   PUT /api/bookings/:id
// @desc    Update booking
router.put('/:id', protect, updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
router.delete('/:id', protect, cancelBooking);

module.exports = router;
