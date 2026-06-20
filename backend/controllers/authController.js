const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const RegistrationOTP = require('../models/RegistrationOTP');
const ForgotPasswordOTP = require('../models/ForgotPasswordOTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendRegistrationOTP, sendForgotPasswordOTP } = require('../utils/emailService');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey1234567890', {
    expiresIn: '30d'
  });
};

// @desc    Send Registration OTP
// @route   POST /api/auth/send-registration-otp
// @access  Public
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists && userExists.role !== 'provider') {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    if (userExists && userExists.role === 'provider' && userExists.approvalStatus !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Provider already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const existingOTP = await RegistrationOTP.findOne({ email }).sort({ createdAt: -1 });
    if (existingOTP) {
      const timeDiff = Date.now() - new Date(existingOTP.createdAt).getTime();
      if (timeDiff < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' });
      }
    }

    await RegistrationOTP.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    await sendRegistrationOTP(email, otp);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration-otp
// @access  Public
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await RegistrationOTP.findOne({ 
      email, 
      otp, 
      verified: false,
      expiresAt: { $gt: Date.now() } 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    
    const verifiedOTP = await RegistrationOTP.findOne({ email, verified: true }).sort({ createdAt: -1 });
    if (!verifiedOTP) {
      return res.status(400).json({ success: false, message: 'Please verify your email with OTP first' });
    }

    let userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.role === 'provider' && userExists.approvalStatus === 'rejected') {
        userExists.fullName = fullName;
        userExists.password = password;
        userExists.phone = phone;
        userExists.approvalStatus = 'pending';
        await userExists.save();

        await ActivityLog.create({
          userId: userExists._id,
          action: 'REAPPLY',
          description: `User reapplied as provider with email: ${email}`
        });

        return res.status(201).json({
          success: true,
          message: 'Re-application successful. Your account is pending admin approval.',
          user: {
            _id: userExists._id,
            fullName: userExists.fullName,
            email: userExists.email,
            role: userExists.role,
            approvalStatus: userExists.approvalStatus
          }
        });
      }
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: role || 'customer',
      approvalStatus: role === 'provider' ? 'pending' : 'approved'
    });

    await ActivityLog.create({
      userId: user._id,
      action: 'REGISTER',
      description: `User registered with email: ${email} and role: ${user.role}`
    });

    await RegistrationOTP.deleteMany({ email });

    if (user.role === 'provider') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is pending admin approval.',
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        }
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'provider' && user.approvalStatus !== 'approved') {
      const msg = user.approvalStatus === 'pending' 
        ? 'Your account is pending admin approval.' 
        : 'Your provider application was rejected. Please go to the registration page to reapply.';
      return res.status(403).json({ success: false, message: msg });
    }

    await ActivityLog.create({
      userId: user._id,
      action: 'LOGIN',
      description: `User logged in with email: ${email}`
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send Forgot Password OTP
// @route   POST /api/auth/send-forgot-password-otp
// @access  Public
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const existingOTP = await ForgotPasswordOTP.findOne({ email }).sort({ createdAt: -1 });
    if (existingOTP) {
      const timeDiff = Date.now() - new Date(existingOTP.createdAt).getTime();
      if (timeDiff < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP' });
      }
    }

    await ForgotPasswordOTP.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    await sendForgotPasswordOTP(email, otp);

    await ActivityLog.create({
      userId: user._id,
      action: 'FORGOT_PASSWORD_OTP',
      description: `Password reset OTP sent to ${email}`
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Forgot Password OTP
// @route   POST /api/auth/verify-forgot-password-otp
// @access  Public
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await ForgotPasswordOTP.findOne({ 
      email, 
      otp, 
      verified: false,
      expiresAt: { $gt: Date.now() } 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const verifiedOTP = await ForgotPasswordOTP.findOne({ email, verified: true }).sort({ createdAt: -1 });
    
    if (!verifiedOTP) {
      return res.status(400).json({ success: false, message: 'Please verify OTP first' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    await ForgotPasswordOTP.deleteMany({ email });

    await ActivityLog.create({
      userId: user._id,
      action: 'RESET_PASSWORD',
      description: `Password reset successfully for ${user.email}`
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'UPDATE_PROFILE',
      description: `Updated profile details for user: ${user.email}`
    });

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: 'CHANGE_PASSWORD',
      description: `Password changed for user: ${user.email}`
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register,
  login,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
};
