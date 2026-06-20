const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/services/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const existing = await ServiceCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await ServiceCategory.create({ name, icon, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search and filter services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sort } = req.query;

    let query = {};

    // Filter by category
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = category;
      } else {
        // Find category by name
        const cat = await ServiceCategory.findOne({ name: { $regex: category, $options: 'i' } });
        if (cat) {
          query.categoryId = cat._id;
        } else {
          // Category search yielded no results
          return res.json({ success: true, services: [], pagination: { total: 0, page: 1, limit: 12, pages: 0 } });
        }
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by averageRating
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Keyword search: Title, Description, or Provider Name (using aggregate/populate search or simple regex)
    let serviceIds = [];
    let isKeywordSearch = false;
    if (keyword) {
      isKeywordSearch = true;
      // Search matching services by title or description
      const matchingServices = await Service.find({
        $or: [
          { serviceTitle: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }).select('_id');
      
      serviceIds = matchingServices.map(s => s._id);

      // Search matching providers
      const User = require('../models/User');
      const matchingProviders = await User.find({
        fullName: { $regex: keyword, $options: 'i' },
        role: 'provider',
        isActive: true
      }).select('_id');

      if (matchingProviders.length > 0) {
        const providerServices = await Service.find({
          providerId: { $in: matchingProviders.map(p => p._id) }
        }).select('_id');
        serviceIds = [...new Set([...serviceIds, ...providerServices.map(s => s._id)])];
      }

      query._id = { $in: serviceIds };
    }

    // Ensure we only ever return services from ACTIVE providers
    const User = require('../models/User');
    const activeProviders = await User.find({ role: 'provider', isActive: true }).select('_id');
    const activeProviderIds = activeProviders.map(p => p._id);
    
    query.providerId = { ...query.providerId, $in: activeProviderIds };

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort) {
      if (sort === 'priceLow') sortOption = { price: 1 };
      else if (sort === 'priceHigh') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { averageRating: -1 };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('providerId', 'fullName email phone profileImage')
      .populate('categoryId', 'name icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get service details by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'fullName email phone profileImage isActive')
      .populate('categoryId', 'name icon description');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.providerId && service.providerId.isActive === false) {
      return res.status(404).json({ success: false, message: 'This service is currently unavailable as the provider is suspended.' });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider)
const createService = async (req, res) => {
  try {
    const { categoryId, serviceTitle, description, price } = req.body;

    let serviceImage = '';
    if (req.file) {
      serviceImage = `/uploads/${req.file.filename}`;
    }

    const service = await Service.create({
      providerId: req.user._id,
      categoryId,
      serviceTitle,
      description,
      price: Number(price),
      serviceImage
    });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'SERVICE_CREATE',
      description: `Provider created service: ${serviceTitle}`
    });

    await Notification.create({
      userId: req.user._id,
      type: 'service_created',
      title: 'Service Created Successfully',
      message: `Your service "${serviceTitle}" has been listed and is ready to accept bookings.`
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider)
const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Verify ownership
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own services' });
    }

    const { categoryId, serviceTitle, description, price } = req.body;

    service.categoryId = categoryId || service.categoryId;
    service.serviceTitle = serviceTitle || service.serviceTitle;
    service.description = description || service.description;
    service.price = price ? Number(price) : service.price;

    if (req.file) {
      service.serviceImage = `/uploads/${req.file.filename}`;
    }

    const updatedService = await service.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'SERVICE_UPDATE',
      description: `Provider updated service: ${service.serviceTitle}`
    });

    res.json({ success: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Verify ownership
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own services' });
    }

    await Service.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user._id,
      action: 'SERVICE_DELETE',
      description: `Provider deleted service: ${service.serviceTitle}`
    });

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider services
// @route   GET /api/services/provider/my
// @access  Private (Provider)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user._id })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices
};
