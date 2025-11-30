const express = require('express');
const router = express.Router();
const { 
  getFlights, 
  getFlight, 
  createFlight, 
  updateFlight, 
  deleteFlight,
  bookFlight,
  getFlightSeats,
  searchFlights,
  getPriceGraph,
  getBookingDetails
} = require('../controllers/flights');
const { protect, authorize } = require('../middleware/auth');

// Search routes (must be before :id routes)
router.get('/search', searchFlights);
router.get('/price-graph', getPriceGraph);
router.get('/booking-details/:token', getBookingDetails);

router.route('/')
  .get(getFlights)
  .post(protect, authorize('admin', 'operator'), createFlight);

router.route('/:id')
  .get(getFlight)
  .put(protect, authorize('admin', 'operator'), updateFlight)
  .delete(protect, authorize('admin'), deleteFlight);

// Flight booking endpoints
router.route('/:id/book')
  .post(protect, bookFlight);

router.route('/:id/seats')
  .get(getFlightSeats);

module.exports = router;
