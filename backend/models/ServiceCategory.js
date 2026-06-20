const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: '' },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
