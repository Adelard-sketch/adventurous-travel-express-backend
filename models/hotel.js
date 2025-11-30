const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  region: String,
  description: String,
  rating: {
    type: Number,
    default: 4.0
  },
  reviews: {
    type: Number,
    default: 0
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  image: String,
  images: [String],
  amenities: [String],
  roomTypes: [{
    name: String,
    description: String,
    price: Number,
    capacity: Number,
    amenities: [String]
  }],
  featured: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['luxury', 'boutique', 'budget', 'resort', 'business'],
    default: 'budget'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
