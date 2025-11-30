const express = require('express');
const router = express.Router();
const { getLocations, getLocation, getRegions } = require('../controllers/locations');

router.get('/', getLocations);
router.get('/regions', getRegions);
router.get('/:id', getLocation);

module.exports = router;
