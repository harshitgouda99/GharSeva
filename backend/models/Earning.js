const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  providerAmount: { type: Number, required: true, min: 0 },
  adminAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'withdrawn'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Earning', earningSchema);
