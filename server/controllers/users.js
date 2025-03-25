const User = require('../models/User');

// @desc    Get user progress
// @route   GET /api/users/progress
// @access  Private
exports.getUserProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'progress.completedLessons',
        select: 'title course',
      })
      .populate({
        path: 'progress.completedTests.testId',
        select: 'title course',
      });

    res.status(200).json({
      success: true,
      data: user.progress,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('+password')  // Include password field if needed
      .populate({
        path: 'progress.completedLessons',
        select: 'title course',
      })
      .populate({
        path: 'progress.completedTests.testId',
        select: 'title course',
      });

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      data: userObject,  // Return full user object without password
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update user level
// @route   PUT /api/users/level
// @access  Private
exports.updateUserLevel = async (req, res, next) => {
  try {
    const { level } = req.body;

    if (!level || !['A1', 'A2', 'B1', 'B2'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid level (A1, A2, B1, B2)',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'progress.currentLevel': level },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.progress,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateUserSettings = async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!language || !['kk', 'ru'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid language (kk, ru)',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'settings.language': language },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};