const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, resolveComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id/resolve', protect, authorize('admin'), resolveComplaint);

module.exports = router;
