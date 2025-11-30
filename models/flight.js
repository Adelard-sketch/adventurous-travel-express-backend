const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: String,
  class: { type: String, enum: ['economy','business','first'], default: 'economy' },
  price: Number,
  isBooked: { type: Boolean, default: false }
});

const FlightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  from: { code: String, city: String, airport: String },
  to: { code: String, city: String, airport: String },
  departureAt: Date,
  arrivalAt: Date,
  duration: Number,
  seats: [SeatSchema],
  createdAt: { type: Date, default: Date.now }
});

FlightSchema.index({ 'from.code': 1, 'to.code': 1, departureAt: 1 });

module.exports = mongoose.model('Flight', FlightSchema);
