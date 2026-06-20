const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a complaint
// @route   POST /api/complaints
// @access  Private (Customer)
const createComplaint = async (req, res) => {
  try {
    const { bookingId, subject, description } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const complaint = await Complaint.create({
      customerId: req.user._id,
      bookingId,
      subject,
      description,
      status: 'pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'COMPLAINT_CREATE',
      description: `Created complaint for booking: ${bookingId}`
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaints (Customer: own, Admin: all)
// @route   GET /api/complaints
// @access  Private (Customer/Admin)
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('customerId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        populate: { path: 'serviceId', select: 'serviceTitle' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Admin)
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Complaint is already resolved.`
      });
    }

    complaint.status = 'resolved';
    await complaint.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'COMPLAINT_RESOLVE',
      description: `Admin resolved complaint ID: ${complaint._id}`
    });

    // Notify Customer
    await Notification.create({
      userId: complaint.customerId,
      type: 'complaint_resolved',
      title: 'Complaint Resolved',
      message: `Your complaint regarding booking ID "${complaint.bookingId}" has been resolved by our support team.`
    });

    res.json({ success: true, message: 'Complaint marked as resolved', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  resolveComplaint
};
