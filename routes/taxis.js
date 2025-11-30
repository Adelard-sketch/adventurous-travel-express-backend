const express = require('express');
const router = express.Router();
const { getTaxis, getTaxi, bookTaxi, createTaxi, updateTaxi, deleteTaxi } = require('../controllers/taxis');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getTaxis)
  .post(protect, authorize('admin', 'operator'), createTaxi);

router.post('/book', protect, bookTaxi);

router.route('/:id')
  .get(getTaxi)
  .put(protect, authorize('admin', 'operator'), updateTaxi)
  .delete(protect, authorize('admin'), deleteTaxi);

module.exports = router;
