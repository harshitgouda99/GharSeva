const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ customerId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
