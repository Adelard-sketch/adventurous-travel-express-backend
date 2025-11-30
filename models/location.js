const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['city', 'region', 'airport', 'attraction', 'area'],
    required: true
  },
  region: String,
  country: {
    type: String,
    default: 'Ghana'
  },
  code: String, // Airport code if applicable
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  popular: {
    type: Boolean,
    default: false
  },
  description: String,
  aliases: [String] // Alternative names for search
}, {
  timestamps: true
});

// Index for faster searches
locationSchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('Location', locationSchema);
