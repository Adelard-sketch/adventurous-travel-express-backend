const express = require('express');
const router = express.Router();
const { getTours, getTour, createTour, updateTour, deleteTour } = require('../controllers/tours');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getTours)
  .post(protect, authorize('admin', 'operator'), createTour);

router.route('/:id')
  .get(getTour)
  .put(protect, authorize('admin', 'operator'), updateTour)
  .delete(protect, authorize('admin'), deleteTour);

module.exports = router;
