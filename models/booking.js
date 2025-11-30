const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['flight', 'tour', 'car', 'taxi', 'park', 'hotel'],
    required: true
  },
  
  // Flight specific
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  airline: String,
  flightNumber: String,
  origin: String,
  from: String,
  destination: String,
  to: String,
  departureDate: Date,
  departureTime: String,
  arrivalDate: Date,
  arrivalTime: String,
  seatClass: String,
  seatNumbers: [String],
  passengers: [{
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    passportNumber: String,
    nationality: String
  }],
  
  // Tour specific
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  tourName: String,
  location: String,
  startDate: Date,
  endDate: Date,
  duration: String,
  participants: Number,
  
  // Car/Taxi specific
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi' },
  vehicleModel: String,
  vehicleType: String,
  pickupDate: Date,
  returnDate: Date,
  pickupLocation: String,
  dropoffLocation: String,
  
  // Park specific
  park: { type: mongoose.Schema.Types.ObjectId, ref: 'Park' },
  parkName: String,
  visitDate: Date,
  visitors: Number,
  ticketType: String,
  
  // Hotel specific
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  hotelName: String,
  checkInDate: Date,
  checkOutDate: Date,
  roomType: String,
  numberOfRooms: Number,
  guests: Number,
  
  // Common fields
  totalPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  specialRequests: String,
  
  date: Date, // Generic date field
  
  // Admin confirmation fields
  confirmedAt: Date,
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for 'type' to match frontend expectations
bookingSchema.virtual('type').get(function() {
  return this.bookingType;
});

// Virtual for 'userId' to match frontend expectations
bookingSchema.virtual('userId').get(function() {
  return this.user;
});

module.exports = mongoose.model('Booking', bookingSchema);
