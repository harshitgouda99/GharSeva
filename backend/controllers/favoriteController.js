const Favorite = require('../models/Favorite');
const Service = require('../models/Service');

// @desc    Toggle favorite status of a service
// @route   POST /api/favorites/toggle
// @access  Private (Customer)
const toggleFavorite = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const favorite = await Favorite.findOne({ customerId: req.user._id, serviceId });
    if (favorite) {
      await Favorite.findByIdAndDelete(favorite._id);
      return res.json({ success: true, isFavorited: false, message: 'Removed from favorites' });
    }

    await Favorite.create({
      customerId: req.user._id,
      serviceId
    });

    res.json({ success: true, isFavorited: true, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer favorites list
// @route   GET /api/favorites
// @access  Private (Customer)
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ customerId: req.user._id })
      .populate({
        path: 'serviceId',
        populate: [
          { path: 'providerId', select: 'fullName email phone profileImage' },
          { path: 'categoryId', select: 'name icon' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites
};
