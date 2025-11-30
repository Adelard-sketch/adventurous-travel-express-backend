const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Payment = require('../models/payment');

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    console.log('📋 Fetching bookings for user:', req.user.id);
    const query = { user: req.user.id };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('flight')
      .populate('tour')
      .populate('vehicle')
      .populate('park')
      .populate('hotel')
      .sort('-createdAt');

    console.log('✅ Found', bookings.length, 'bookings');
    console.log('📦 Booking types:', bookings.map(b => b.bookingType).join(', '));

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('tour')
      .populate('vehicle')
      .populate('park')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    console.log('📝 Creating new booking...');
    console.log('Booking type:', req.body.bookingType);
    console.log('Booking data:', JSON.stringify(req.body, null, 2));
    
    // Add user to req.body
    req.body.user = req.user.id;

    // Set default status if not provided
    if (!req.body.status) {
      req.body.status = 'confirmed';
    }

    // Set default payment status if not provided
    if (!req.body.paymentStatus) {
      req.body.paymentStatus = 'pending';
    }

    // Validate booking type
    const validTypes = ['flight', 'tour', 'taxi', 'park', 'hotel'];
    if (!validTypes.includes(req.body.bookingType)) {
      console.error('❌ Invalid booking type:', req.body.bookingType);
      return res.status(400).json({
        success: false,
        error: 'Invalid booking type'
      });
    }

    // Ensure totalPrice is provided
    if (!req.body.totalPrice || req.body.totalPrice <= 0) {
      console.error('❌ Invalid total price:', req.body.totalPrice);
      return res.status(400).json({
        success: false,
        error: 'Total price is required and must be greater than 0'
      });
    }

    const booking = await Booking.create(req.body);
    console.log('✅ Booking created successfully:', booking._id);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    // Don't allow status changes to cancelled through this route
    if (req.body.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Use the cancel route to cancel bookings'
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    console.log('🚫 Cancelling booking:', req.params.id);
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      console.error('❌ Booking not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();
    console.log('✅ Booking cancelled successfully:', req.params.id);

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
