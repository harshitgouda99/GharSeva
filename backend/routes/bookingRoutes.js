const express = require('express');
const router = express.Router();
const {
  createBooking,
  acceptBooking,
  rejectBooking,
  sendCompletionOtp,
  verifyCompletionOtp,
  cancelBooking,
  getCustomerBookings,
  getProviderBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/customer', protect, authorize('customer'), getCustomerBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);

router.put('/:id/accept', protect, authorize('provider'), acceptBooking);
router.put('/:id/reject', protect, authorize('provider'), rejectBooking);
router.post('/:id/send-completion-otp', protect, authorize('provider'), sendCompletionOtp);
router.post('/:id/verify-completion-otp', protect, authorize('provider'), verifyCompletionOtp);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
