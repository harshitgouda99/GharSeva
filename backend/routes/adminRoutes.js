const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleUserActivation,
  getActivityLogs,
  broadcastNotification,
  getPendingProviders,
  approveProvider,
  rejectProvider
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserActivation);
router.get('/logs', getActivityLogs);
router.post('/broadcast', broadcastNotification);

router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);

module.exports = router;
