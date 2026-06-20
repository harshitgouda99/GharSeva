const Earning = require('../models/Earning');

// @desc    Get provider earnings
// @route   GET /api/earnings/my
// @access  Private (Provider)
const getProviderEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find({ providerId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({ success: true, earnings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProviderEarnings
};
