const express = require('express');
const router = express.Router();
const { getParks, getPark, createPark, updatePark, deletePark } = require('../controllers/parks');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getParks)
  .post(protect, authorize('admin', 'operator'), createPark);

router.route('/:id')
  .get(getPark)
  .put(protect, authorize('admin', 'operator'), updatePark)
  .delete(protect, authorize('admin'), deletePark);

module.exports = router;
