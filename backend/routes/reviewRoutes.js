const express = require('express');
const router = express.Router();
const { addReview, editReview, deleteReview, getServiceReviews, getProviderReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);

router.post('/', protect, authorize('customer'), addReview);
router.put('/:id', protect, authorize('customer'), editReview);
router.delete('/:id', protect, authorize('customer'), deleteReview);

module.exports = router;
