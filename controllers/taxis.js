const Taxi = require('../models/taxi');
const Booking = require('../models/booking');

// @desc    Get all taxis
// @route   GET /api/taxis
// @access  Public
exports.getTaxis = async (req, res, next) => {
  try {
    const { location, vehicleType, passengers, page = 1, limit = 10 } = req.query;

    let query = {};

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (passengers) {
      query.capacity = { $gte: Number(passengers) };
    }

    const taxis = await Taxi.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ pricePerKm: 1 });

    const total = await Taxi.countDocuments(query);

    res.json({
      success: true,
      count: taxis.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: taxis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single taxi
// @route   GET /api/taxis/:id
// @access  Public
exports.getTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.findById(req.params.id);

    if (!taxi) {
      return res.status(404).json({ success: false, message: 'Taxi not found' });
    }

    res.json({ success: true, data: taxi });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a taxi
// @route   POST /api/taxis/book
// @access  Private
exports.bookTaxi = async (req, res, next) => {
  try {
    const { taxiId, pickup, dropoff, pickupTime, passengers } = req.body;

    const taxi = await Taxi.findById(taxiId);
    if (!taxi) {
      return res.status(404).json({ success: false, message: 'Taxi not found' });
    }

    if (!taxi.isAvailable) {
      return res.status(400).json({ success: false, message: 'Taxi not available' });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      itemType: 'taxi',
      item: taxiId,
      startDate: pickupTime,
      passengers: { adults: passengers, children: 0, total: passengers },
      price: taxi.basePrice,
      status: 'pending',
      metadata: { pickup, dropoff }
    });

    res.status(201).json({
      success: true,
      message: 'Taxi booked successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create taxi
// @route   POST /api/taxis
// @access  Private (admin/operator)
exports.createTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.create(req.body);
    res.status(201).json({ success: true, data: taxi });
  } catch (error) {
    next(error);
  }
};

// @desc    Update taxi
// @route   PUT /api/taxis/:id
// @access  Private (admin/operator)
exports.updateTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!taxi) {
      return res.status(404).json({ success: false, message: 'Taxi not found' });
    }

    res.json({ success: true, data: taxi });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete taxi
// @route   DELETE /api/taxis/:id
// @access  Private (admin)
exports.deleteTaxi = async (req, res, next) => {
  try {
    const taxi = await Taxi.findById(req.params.id);

    if (!taxi) {
      return res.status(404).json({ success: false, message: 'Taxi not found' });
    }

    await taxi.deleteOne();
    res.json({ success: true, message: 'Taxi deleted' });
  } catch (error) {
    next(error);
  }
};
