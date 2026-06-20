const mongoose = require('mongoose');

const providerApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  skills: [{ type: String }],
  documents: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProviderApplication', providerApplicationSchema);
