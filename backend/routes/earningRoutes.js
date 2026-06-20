const express = require('express');
const router = express.Router();
const { getProviderEarnings } = require('../controllers/earningController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/my').get(getProviderEarnings);

module.exports = router;
