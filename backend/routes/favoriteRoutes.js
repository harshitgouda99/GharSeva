const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/toggle', protect, authorize('customer'), toggleFavorite);
router.get('/', protect, authorize('customer'), getFavorites);

module.exports = router;
