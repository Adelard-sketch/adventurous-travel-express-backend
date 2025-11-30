const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  title: { type: String, required: true, text: true },
  description: { type: String, text: true },
  price: { type: Number, required: true },
  durationDays: Number,
  startLocations: [{ 
    type: { type: String, enum:['Point'], default: 'Point' },
    coordinates: { type: [Number] } 
  }],
  images: [String],
  capacity: Number,
  availableDates: [{ date: Date, seatsLeft: Number }],
  tags: [String],
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

TourSchema.index({ title: 'text', description: 'text', tags: 'text' });
TourSchema.index({ 'startLocations': '2dsphere' });

module.exports = mongoose.model('Tour', TourSchema);
