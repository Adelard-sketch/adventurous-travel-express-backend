const Payment = require('../models/payment');
const Booking = require('../models/booking');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Create payment intent for Stripe
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const paymentAmount = amount || booking.totalPrice || 0;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: bookingId,
        userId: req.user.id,
        bookingType: booking.bookingType
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    next(error);
  }
};

// Process payment (after Stripe confirmation)
exports.createPayment = async (req, res, next) => {
  try {
    console.log('💳 Processing payment...');
    console.log('Payment data:', req.body);
    
    const { booking: bookingId, bookingId: altBookingId, paymentMethod, amount, paymentIntentId, cardDetails } = req.body;
    const finalBookingId = bookingId || altBookingId;

    if (!finalBookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(finalBookingId);
    if (!booking) {
      console.error('❌ Booking not found:', finalBookingId);
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const paymentAmount = amount || booking.totalPrice || booking.price;

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      booking: finalBookingId,
      amount: paymentAmount,
      paymentMethod: paymentMethod || 'card',
      status: 'completed',
      transactionId: paymentIntentId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardLast4: cardDetails?.last4,
      cardBrand: cardDetails?.brand
    });

    // Update booking
    booking.payment = payment._id;
    booking.paymentStatus = 'paid';
    booking.status = 'pending'; // Admin will confirm
    await booking.save();

    console.log('✅ Payment processed successfully:', payment._id);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
      booking: booking
    });
  } catch (error) {
    console.error('Payment error:', error);
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { user: req.user.id };

    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('booking')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
