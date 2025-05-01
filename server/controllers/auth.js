const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, telephone, gender, age } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      telephone,
      gender,
      age
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      telephone: req.body.telephone,
      gender: req.body.gender,
      age: req.body.age
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Create reset token with expiration
    await PasswordResetToken.create({
      user: user._id,
      token: hashedOtp,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour expiration
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email message
    const message = `
      <h1>Құпия сөзді қалпына келтіру OTP коды</h1>
      <p>Сізге бұл хат аккаунтыңыздың құпия сөзін қалпына келтіру сұрағы үшін жіберілді.</p>
      <p>Сіздің OTP кодыңыз: <strong>${otp}</strong></p>
      <p>Бұл код 1 сағаттан кейін мерзімі аяқталады.</p>
      <p>Егер сіз бұл сұрауды жасамаған болсаңыз, осы хатты елемеңіз.</p>
    `;

    // Send email
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: message
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the provided OTP
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      user: user._id,
      token: hashedOtp,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP and new password',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the provided OTP
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      user: user._id,
      token: hashedOtp,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete reset token
    await resetToken.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      telephone: user.telephone,
      gender: user.gender,
      age: user.age,
      progress: user.progress,
    },
  });
}; 