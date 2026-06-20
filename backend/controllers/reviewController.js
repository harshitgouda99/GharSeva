const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ActivityLog = require('../models/ActivityLog');

// Helper function to update service rating statistics
const updateServiceRatingStats = async (serviceId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { serviceId } },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Service.findByIdAndUpdate(serviceId, {
        averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews
      });
    } else {
      await Service.findByIdAndUpdate(serviceId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error(`Error updating rating stats: ${error.message}`);
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Customer)
const addReview = async (req, res) => {
  try {
    const { bookingId, rating, reviewText } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings' });
    }

    // Check status
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed services' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      customerId: req.user._id,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      bookingId,
      rating: Number(rating),
      reviewText
    });

    await updateServiceRatingStats(booking.serviceId);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'REVIEW_ADD',
      description: `Added review for booking: ${bookingId}`
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Customer)
const editReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    let review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership
    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    review.rating = Number(rating) || review.rating;
    review.reviewText = reviewText || review.reviewText;
    await review.save();

    await updateServiceRatingStats(review.serviceId);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'REVIEW_EDIT',
      description: `Updated review: ${review._id}`
    });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership
    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    await updateServiceRatingStats(review.serviceId);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'REVIEW_DELETE',
      description: `Deleted review: ${review._id}`
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get service reviews
// @route   GET /api/reviews/service/:serviceId
// @access  Public
const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('customerId', 'fullName profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'fullName profileImage')
      .populate('serviceId', 'serviceTitle')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReview,
  editReview,
  deleteReview,
  getServiceReviews,
  getProviderReviews
};
