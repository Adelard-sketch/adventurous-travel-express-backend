const express = require('express');
const router = express.Router();
const { getHotels, getHotel } = require('../controllers/hotels');

router.get('/', getHotels);
router.get('/:id', getHotel);

module.exports = router;
