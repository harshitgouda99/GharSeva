const Address = require('../models/Address');

// @desc    Get all addresses for user
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create address
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res) => {
  try {
    const { fullName, phone, houseNo, area, city, state, pincode, isDefault } = req.body;

    const count = await Address.countDocuments({ userId: req.user._id });
    
    // If first address, make it default automatically
    const makeDefault = count === 0 ? true : isDefault === 'true' || isDefault === true;

    if (makeDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      fullName,
      phone,
      houseNo,
      area,
      city,
      state,
      pincode,
      isDefault: makeDefault
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    let address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { fullName, phone, houseNo, area, city, state, pincode, isDefault } = req.body;

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.houseNo = houseNo || address.houseNo;
    address.area = area || address.area;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;

    const makeDefault = isDefault === 'true' || isDefault === true;
    if (makeDefault && !address.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    await address.save();
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(req.params.id);

    // If we deleted the default address and there are others left, set the first one as default
    if (wasDefault) {
      const remaining = await Address.findOne({ userId: req.user._id });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
