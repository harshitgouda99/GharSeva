const ProviderApplication = require('../models/ProviderApplication');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Apply as a provider
// @route   POST /api/providers/apply
// @access  Private (Customer)
const applyProvider = async (req, res) => {
  try {
    const { category, experience, skills } = req.body;

    const existingApp = await ProviderApplication.findOne({ userId: req.user._id });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: `You have already submitted an application. Status: ${existingApp.status}`
      });
    }

    let docs = [];
    if (req.files) {
      docs = req.files.map(file => `/uploads/${file.filename}`);
    }

    const application = await ProviderApplication.create({
      userId: req.user._id,
      category,
      experience: Number(experience),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      documents: docs,
      status: 'pending'
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'PROVIDER_APPLY',
      description: `User applied for provider category: ${category}`
    });

    // Notify Admin (or create system notification for admins)
    // For simplicity, let's create a notification for the user that their application is received
    await Notification.create({
      userId: req.user._id,
      type: 'provider_applied',
      title: 'Application Submitted',
      message: 'Your application to become a provider has been submitted and is under review.'
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's provider application
// @route   GET /api/providers/application
// @access  Private
const getMyApplication = async (req, res) => {
  try {
    const application = await ProviderApplication.findOne({ userId: req.user._id });
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve provider application
// @route   PUT /api/providers/approve/:id
// @access  Private (Admin)
const approveProvider = async (req, res) => {
  try {
    const application = await ProviderApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been resolved. Status: ${application.status}`
      });
    }

    application.status = 'approved';
    await application.save();

    // Update user role to 'provider'
    const user = await User.findById(application.userId);
    if (user) {
      user.role = 'provider';
      await user.save();

      await Notification.create({
        userId: user._id,
        type: 'provider_approved',
        title: 'Provider Application Approved',
        message: 'Congratulations! Your application to join GharSeva as a provider has been approved.'
      });

      await ActivityLog.create({
        userId: req.user._id,
        action: 'PROVIDER_APPROVE',
        description: `Admin approved provider application for user: ${user.email}`
      });
    }

    res.json({ success: true, message: 'Provider application approved successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject provider application
// @route   PUT /api/providers/reject/:id
// @access  Private (Admin)
const rejectProvider = async (req, res) => {
  try {
    const application = await ProviderApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application has already been resolved. Status: ${application.status}`
      });
    }

    application.status = 'rejected';
    await application.save();

    await Notification.create({
      userId: application.userId,
      type: 'provider_rejected',
      title: 'Provider Application Rejected',
      message: 'We regret to inform you that your provider application has been rejected after document verification.'
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'PROVIDER_REJECT',
      description: `Admin rejected provider application for userId: ${application.userId}`
    });

    res.json({ success: true, message: 'Provider application rejected successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all provider applications
// @route   GET /api/providers/applications
// @access  Private (Admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await ProviderApplication.find()
      .populate('userId', 'fullName email phone profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyProvider,
  getMyApplication,
  approveProvider,
  rejectProvider,
  getAllApplications
};
