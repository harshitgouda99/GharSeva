const express = require('express');
const router = express.Router();
const {
  applyProvider,
  getMyApplication,
  approveProvider,
  rejectProvider,
  getAllApplications
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/apply', protect, upload.array('documents', 5), applyProvider);
router.get('/application', protect, getMyApplication);

// Admin only routes
router.get('/applications', protect, authorize('admin'), getAllApplications);
router.put('/approve/:id', protect, authorize('admin'), approveProvider);
router.put('/reject/:id', protect, authorize('admin'), rejectProvider);

module.exports = router;
