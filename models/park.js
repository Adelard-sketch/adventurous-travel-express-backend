const mongoose = require('mongoose');

const ParkSchema = new mongoose.Schema({
  name: { type: String, required: true, text: true },
  description: { type: String, text: true },
  country: { type: String, required: true },
  location: { 
    type: { type: String, enum: ['Point'], default: 'Point' }, 
    coordinates: [Number] 
  },
  entryFee: { type: Number, required: true },
  capacity: Number,
  openHours: String,
  features: [String],
  images: [String],
  activities: [String],
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviews: { type: Number, default: 0 },
  bookingsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

ParkSchema.index({ location: '2dsphere' });
ParkSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Park', ParkSchema);
