const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('Auth headers:', req.headers.authorization); // Debug log

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Extracted token:', token); // Debug log
  }

  // Make sure token exists
  if (!token) {
    console.log('No token found in request'); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    req.user = await User.findById(decoded.id);
    console.log('Found user:', req.user); // Debug log

    next();
  } catch (err) {
    console.log('Token verification error:', err); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Admin authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Default to 'user' role if role field doesn't exist (for backward compatibility)
    const userRole = req.user.role || 'user';

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${userRole} is not authorized to access this route`,
      });
    }
    next();
  };
}; 