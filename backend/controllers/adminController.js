const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const ProviderApplication = require('../models/ProviderApplication');
const Earning = require('../models/Earning');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const ServiceCategory = require('../models/ServiceCategory');

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });
    const pendingRequests = await ProviderApplication.countDocuments({ status: 'pending' });

    // Calculate total revenue
    const revenueStats = await Earning.aggregate([
      { $group: { _id: null, totalAdmin: { $sum: '$adminAmount' }, totalProvider: { $sum: '$providerAmount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalAdmin : 0;
    const totalProvider = revenueStats.length > 0 ? revenueStats[0].totalProvider : 0;

    // Monthly revenue/bookings statistics (for Recharts)
    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          bookings: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = monthlyStats.map(stat => ({
      name: months[stat._id - 1] || `Month ${stat._id}`,
      Bookings: stat.bookings,
      Completed: stat.completed
    }));

    // Category distribution of services
    const categoryStats = await Service.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      }
    ]);
    const populatedCategoryStats = await ServiceCategory.populate(categoryStats, { path: '_id', select: 'name' });
    const categoryData = populatedCategoryStats.map(c => ({
      name: c._id ? c._id.name : 'Unknown',
      value: c.count
    }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProviders,
        totalServices,
        totalBookings,
        completedBookings,
        pendingRequests,
        totalRevenue,
        totalProvider
      },
      analytics: {
        monthlyBookings: chartData,
        categoryDistribution: categoryData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (customers and providers)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle User Activation (Suspend / Unsuspend)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserActivation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend admin users' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: user.isActive ? 'USER_REACTIVATE' : 'USER_SUSPEND',
      description: `Admin toggled status for user: ${user.email} (Active: ${user.isActive})`
    });

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'reactivated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Activity Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Broadcast Notification to all users
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const broadcastNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    const users = await User.find({ role: { $ne: 'admin' } }).select('_id');
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'broadcast',
      title,
      message
    }));

    await Notification.insertMany(notifications);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'BROADCAST_NOTIFICATION',
      description: `Admin broadcasted alert: ${title}`
    });

    res.json({ success: true, message: 'Notification broadcasted to all active accounts' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending provider registrations
// @route   GET /api/admin/providers/pending
// @access  Private (Admin)
const getPendingProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider', approvalStatus: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a provider
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin)
const approveProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.approvalStatus = 'approved';
    await provider.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'APPROVE_PROVIDER',
      description: `Admin approved provider registration for: ${provider.email}`
    });

    res.json({ success: true, message: 'Provider approved successfully', provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a provider
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin)
const rejectProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    provider.approvalStatus = 'rejected';
    await provider.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'REJECT_PROVIDER',
      description: `Admin rejected provider registration for: ${provider.email}`
    });

    res.json({ success: true, message: 'Provider rejected successfully', provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserActivation,
  getActivityLogs,
  broadcastNotification,
  getPendingProviders,
  approveProvider,
  rejectProvider
};
