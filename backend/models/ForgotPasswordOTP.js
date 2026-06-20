const mongoose = require('mongoose');

const forgotPasswordOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: 'forgotPassword' },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 } // TTL index for 5 minutes
});

module.exports = mongoose.model('ForgotPasswordOTP', forgotPasswordOTPSchema);
