const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);

router.get('/', getServices);
router.get('/provider/my', protect, authorize('provider'), getMyServices);
router.get('/:id', getServiceById);

router.post('/', protect, authorize('provider'), upload.single('serviceImage'), createService);
router.put('/:id', protect, authorize('provider'), upload.single('serviceImage'), updateService);
router.delete('/:id', protect, authorize('provider'), deleteService);

module.exports = router;
