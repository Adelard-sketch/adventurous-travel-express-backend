const mongoose = require('mongoose');

const TaxiSchema = new mongoose.Schema({
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleType: { type: String, enum: ['sedan', 'suv', 'van', 'luxury'], default: 'sedan' },
  carModel: { type: String, required: true },
  licensePlate: String,
  capacity: { type: Number, default: 4 },
  basePrice: { type: Number, required: true },
  pricePerKm: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  features: [String],
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  totalRides: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

TaxiSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Taxi', TaxiSchema);
