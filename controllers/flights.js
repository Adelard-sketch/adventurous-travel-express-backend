const Flight = require('../models/flight');
const Booking = require('../models/booking');
const flightScraperService = require('../flightScraperService');
const mockFlightService = require('../mockFlightService');

// Use mock service if API is not subscribed
const USE_MOCK_DATA = process.env.USE_MOCK_FLIGHTS === 'true' || process.env.USE_MOCK_FLIGHTS === '1';
const flightService = USE_MOCK_DATA ? mockFlightService : flightScraperService;

// @desc    Get all flights with search and filtering
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res, next) => {
  try {
    const { from, to, date, passengers, class: seatClass, page = 1, limit = 10 } = req.query;

    let query = {};

    if (from) query['from.code'] = from.toUpperCase();
    if (to) query['to.code'] = to.toUpperCase();
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureAt = { $gte: startDate, $lt: endDate };
    }

    const flights = await Flight.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ departureAt: 1 });

    // Filter by available seats and add pricing info
    const filteredFlights = flights.map(flight => {
      const flightObj = flight.toObject();
      
      // Calculate available seats by class
      const seatsByClass = {
        economy: { available: 0, minPrice: Infinity },
        business: { available: 0, minPrice: Infinity },
        first: { available: 0, minPrice: Infinity }
      };

      flightObj.seats.forEach(seat => {
        if (!seat.isBooked) {
          seatsByClass[seat.class].available++;
          if (seat.price < seatsByClass[seat.class].minPrice) {
            seatsByClass[seat.class].minPrice = seat.price;
          }
        }
      });

      // Set Infinity to null for classes with no available seats
      Object.keys(seatsByClass).forEach(cls => {
        if (seatsByClass[cls].minPrice === Infinity) {
          seatsByClass[cls].minPrice = null;
        }
      });

      flightObj.seatsByClass = seatsByClass;
      flightObj.totalAvailableSeats = flightObj.seats.filter(s => !s.isBooked).length;
      
      // Filter seats if class specified
      if (seatClass) {
        flightObj.availableSeats = flightObj.seats.filter(seat => 
          seat.class === seatClass && !seat.isBooked
        );
      } else {
        flightObj.availableSeats = flightObj.seats.filter(s => !s.isBooked);
      }

      // Don't send all seat details in list view
      delete flightObj.seats;

      return flightObj;
    });

    const total = await Flight.countDocuments(query);

    res.json({
      success: true,
      count: filteredFlights.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: filteredFlights
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single flight
// @route   GET /api/flights/:id
// @access  Public
exports.getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    res.json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new flight
// @route   POST /api/flights
// @access  Private (admin/operator)
exports.createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// @desc    Update flight
// @route   PUT /api/flights/:id
// @access  Private (admin/operator)
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    res.json({ success: true, data: flight });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flight
// @route   DELETE /api/flights/:id
// @access  Private (admin)
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    await flight.deleteOne();
    res.json({ success: true, message: 'Flight deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a flight
// @route   POST /api/flights/:id/book
// @access  Private
exports.bookFlight = async (req, res, next) => {
  try {
    const { seatIds, passengers, passengerDetails } = req.body;

    // Validation
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide seat IDs to book'
      });
    }

    if (!passengers || !passengers.adults) {
      return res.status(400).json({
        success: false,
        message: 'Please provide passenger information'
      });
    }

    // Find flight
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    // Check if flight has already departed
    if (new Date(flight.departureAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a flight that has already departed'
      });
    }

    // Verify all seats exist and are available
    const requestedSeats = [];
    let totalPrice = 0;

    for (const seatId of seatIds) {
      const seat = flight.seats.id(seatId);
      
      if (!seat) {
        return res.status(404).json({
          success: false,
          message: `Seat ${seatId} not found on this flight`
        });
      }

      if (seat.isBooked) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat.seatNumber} is already booked`
        });
      }

      requestedSeats.push(seat);
      totalPrice += seat.price;
    }

    // Mark seats as booked
    requestedSeats.forEach(seat => {
      seat.isBooked = true;
    });

    await flight.save();

    // Create booking record with correct schema
    const booking = await Booking.create({
      user: req.user.id,
      bookingType: 'flight',
      flight: flight._id,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      from: flight.from.name,
      to: flight.to.name,
      origin: flight.from.city,
      destination: flight.to.city,
      departureDate: flight.departureAt,
      arrivalDate: flight.arrivalAt,
      seatClass: requestedSeats[0].class,
      seatNumbers: requestedSeats.map(s => s.seatNumber),
      passengers: passengerDetails || [],
      totalPrice: totalPrice,
      currency: 'USD',
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    // Populate booking with flight details
    const populatedBooking = await Booking.findById(booking._id).populate('flight');

    res.status(201).json({
      success: true,
      message: 'Flight booked successfully',
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available seats for a flight
// @route   GET /api/flights/:id/seats
// @access  Public
exports.getFlightSeats = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    const { class: seatClass } = req.query;

    let seats = flight.seats;

    // Filter by class if specified
    if (seatClass) {
      seats = seats.filter(seat => seat.class === seatClass);
    }

    // Group seats by class and availability
    const seatMap = {
      economy: { available: [], booked: [] },
      business: { available: [], booked: [] },
      first: { available: [], booked: [] }
    };

    seats.forEach(seat => {
      const seatData = {
        id: seat._id,
        seatNumber: seat.seatNumber,
        price: seat.price
      };

      if (seat.isBooked) {
        seatMap[seat.class].booked.push(seatData);
      } else {
        seatMap[seat.class].available.push(seatData);
      }
    });

    res.status(200).json({
      success: true,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      route: `${flight.from.city} (${flight.from.code}) → ${flight.to.city} (${flight.to.code})`,
      departureAt: flight.departureAt,
      seats: seatMap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search flights using Flight Scraper API
// @route   GET /api/flights/search
// @access  Public
exports.searchFlights = async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      returnDate,
      adults = 1,
      cabinClass = 'economy',
      tripType = 'roundtrip'
    } = req.query;

    console.log('=== Flight Search Request ===');
    console.log('From:', from);
    console.log('To:', to);
    console.log('Departure Date:', departureDate);
    console.log('Return Date:', returnDate);
    console.log('Adults:', adults);
    console.log('Cabin Class:', cabinClass);
    console.log('Trip Type:', tripType);

    // Validate required fields
    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide origin, destination, and departure date'
      });
    }

    // Convert airport names to codes if needed
    const departureId = flightService.getAirportCode(from);
    const arrivalId = flightService.getAirportCode(to);

    console.log('Converted to airport codes:');
    console.log('Departure ID:', departureId);
    console.log('Arrival ID:', arrivalId);

    let flights;
    let usedMockData = false;

    try {
      if (tripType === 'oneway' || !returnDate) {
        console.log('Searching one-way flights...');
        // Search one-way flights
        flights = await flightScraperService.searchOneWay({
          departureId,
          arrivalId,
          departureDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      } else {
        console.log('Searching round-trip flights...');
        // Search round-trip flights
        flights = await flightScraperService.searchRoundTrip({
          departureId,
          arrivalId,
          departureDate,
          returnDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      }
    } catch (apiError) {
      // If API fails (not subscribed or other error), use mock data
      console.log('⚠️ API Error, falling back to mock data:', apiError.message);
      usedMockData = true;
      
      if (tripType === 'oneway' || !returnDate) {
        flights = await mockFlightService.searchOneWay({
          departureId,
          arrivalId,
          departureDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      } else {
        flights = await mockFlightService.searchRoundTrip({
          departureId,
          arrivalId,
          departureDate,
          returnDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      }
    }

    console.log(`Found ${flights.length} flights`);
    
    // If API returned 0 flights, use mock data as fallback
    if (flights.length === 0 && !usedMockData) {
      console.log('⚠️ API returned 0 flights, using mock data for better UX');
      usedMockData = true;
      
      if (tripType === 'oneway' || !returnDate) {
        flights = await mockFlightService.searchOneWay({
          departureId,
          arrivalId,
          departureDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      } else {
        flights = await mockFlightService.searchRoundTrip({
          departureId,
          arrivalId,
          departureDate,
          returnDate,
          adults: parseInt(adults),
          cabinClass: cabinClass.toLowerCase()
        });
      }
      
      console.log(`Generated ${flights.length} mock flights`);
    }

    // Optionally cache flights in database
    // await Flight.insertMany(flights.map(f => ({ ...f, expiresAt: new Date(Date.now() + 3600000) })));

    res.json({
      success: true,
      count: flights.length,
      data: flights,
      isMockData: usedMockData,
      message: usedMockData ? 'Using sample data. Subscribe to RapidAPI for real flight data.' : undefined,
      searchParams: {
        from: departureId,
        to: arrivalId,
        departureDate,
        returnDate,
        adults,
        tripType
      }
    });

  } catch (error) {
    console.error('Flight search error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching flights',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get price graph for a route
// @route   GET /api/flights/price-graph
// @access  Public
exports.getPriceGraph = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide origin and destination'
      });
    }

    const departureId = flightScraperService.getAirportCode(from);
    const arrivalId = flightScraperService.getAirportCode(to);

    const priceData = await flightScraperService.getPriceGraph({
      departureId,
      arrivalId
    });

    res.json({
      success: true,
      data: priceData
    });

  } catch (error) {
    console.error('Price graph error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting price graph'
    });
  }
};

// @desc    Get flight booking details
// @route   GET /api/flights/booking-details/:token
// @access  Public
exports.getBookingDetails = async (req, res) => {
  try {
    const { token } = req.params;

    const details = await flightScraperService.getBookingDetails(token);

    res.json({
      success: true,
      data: details
    });

  } catch (error) {
    console.error('Booking details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting booking details'
    });
  }
};
