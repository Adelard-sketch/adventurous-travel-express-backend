const Location = require('../models/location');

// Get all locations with optional filters
exports.getLocations = async (req, res) => {
  try {
    const { region, type, popular, search } = req.query;
    
    const filter = {};
    
    if (region) filter.region = region;
    if (type) filter.type = type;
    if (popular === 'true') filter.popular = true;
    
    if (search) {
      // Use text search if available
      filter.$text = { $search: search };
    }
    
    const locations = await Location.find(filter).sort({ popular: -1, name: 1 });
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

// Get single location by ID
exports.getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
};

// Get all unique regions
exports.getRegions = async (req, res) => {
  try {
    const regions = await Location.distinct('region');
    
    res.json({
      success: true,
      count: regions.length,
      data: regions
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching regions',
      error: error.message
    });
  }
};
