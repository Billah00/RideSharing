const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromCity: { type: String, required: true },
  toCity: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  seatsLeft: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['active', 'full', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
