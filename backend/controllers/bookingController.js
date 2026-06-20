const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Earning = require('../models/Earning');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const BookingCompletionOTP = require('../models/BookingCompletionOTP');
const { sendBookingCompletionOTP } = require('../utils/emailService');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, addressId } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId: service.providerId,
      serviceId,
      bookingDate: new Date(bookingDate),
      addressId,
      bookingStatus: 'pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BOOKING_CREATE',
      description: `Customer booked service: ${service.serviceTitle}`
    });

    // Notify Provider
    await Notification.create({
      userId: service.providerId,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `You have received a new request for "${service.serviceTitle}". Please accept or reject it.`
    });

    // Notify Customer
    await Notification.create({
      userId: req.user._id,
      type: 'booking_created',
      title: 'Booking Placed',
      message: `Your booking request for "${service.serviceTitle}" has been submitted.`
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a booking request
// @route   PUT /api/bookings/:id/accept
// @access  Private (Provider)
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify provider ownership
    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking. Status is already: ${booking.bookingStatus}`
      });
    }

    booking.bookingStatus = 'accepted';
    await booking.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BOOKING_ACCEPT',
      description: `Provider accepted booking: ${booking._id}`
    });

    // Notify Customer
    await Notification.create({
      userId: booking.customerId,
      type: 'booking_accepted',
      title: 'Booking Accepted',
      message: `Your booking for "${booking.serviceId.serviceTitle}" has been accepted by the provider.`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Provider)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify provider ownership
    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking. Status is already: ${booking.bookingStatus}`
      });
    }

    booking.bookingStatus = 'rejected';
    await booking.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BOOKING_REJECT',
      description: `Provider rejected booking: ${booking._id}`
    });

    // Notify Customer
    await Notification.create({
      userId: booking.customerId,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking for "${booking.serviceId.serviceTitle}" has been rejected by the provider.`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send Completion OTP to Customer
// @route   POST /api/bookings/:id/send-completion-otp
// @access  Private (Provider)
const sendCompletionOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId').populate('customerId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    if (booking.bookingStatus !== 'accepted') {
      return res.status(400).json({ success: false, message: `Cannot generate OTP. Status is: ${booking.bookingStatus}` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const existingOTP = await BookingCompletionOTP.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    if (existingOTP) {
      const timeDiff = Date.now() - new Date(existingOTP.createdAt).getTime();
      if (timeDiff < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' });
      }
    }

    await BookingCompletionOTP.create({
      bookingId: booking._id,
      customerId: booking.customerId._id,
      providerId: req.user._id,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    await sendBookingCompletionOTP(booking.customerId.email, otp, booking.serviceId.serviceTitle);

    res.json({ success: true, message: 'OTP sent to customer email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Completion OTP and Complete Booking
// @route   POST /api/bookings/:id/verify-completion-otp
// @access  Private (Provider)
const verifyCompletionOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    const otpRecord = await BookingCompletionOTP.findOne({
      bookingId: booking._id,
      otp,
      verified: false,
      expiresAt: { $gt: Date.now() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    booking.bookingStatus = 'completed';
    await booking.save();

    await Earning.create({
      providerId: req.user._id,
      bookingId: booking._id,
      amount: booking.serviceId.price,
      providerAmount: parseFloat((booking.serviceId.price * 0.95).toFixed(2)),
      adminAmount: parseFloat((booking.serviceId.price * 0.05).toFixed(2)),
      status: 'pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BOOKING_COMPLETE',
      description: `Provider completed booking: ${booking._id} via OTP`
    });

    await Notification.create({
      userId: booking.customerId,
      type: 'booking_completed',
      title: 'Service Completed',
      message: `Your service "${booking.serviceId.serviceTitle}" has been completed.`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking (Customer action)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify customer ownership
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    // Customer can only cancel pending or accepted bookings
    if (!['pending', 'accepted'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking at this stage: ${booking.bookingStatus}`
      });
    }

    booking.bookingStatus = 'rejected';
    await booking.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BOOKING_CANCEL',
      description: `Customer cancelled booking: ${booking._id}`
    });

    // Notify Provider
    await Notification.create({
      userId: booking.providerId,
      type: 'booking_rejected',
      title: 'Booking Cancelled',
      message: `The booking request for "${booking.serviceId.serviceTitle}" has been cancelled by the customer.`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer booking history
// @route   GET /api/bookings/customer
// @access  Private (Customer)
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('providerId', 'fullName email phone profileImage')
      .populate('serviceId', 'serviceTitle description price serviceImage')
      .populate('addressId')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider booking requests & history
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user._id })
      .populate('customerId', 'fullName email phone profileImage')
      .populate('serviceId', 'serviceTitle description price serviceImage')
      .populate('addressId')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  sendCompletionOtp,
  verifyCompletionOtp,
  cancelBooking,
  getCustomerBookings,
  getProviderBookings
};
