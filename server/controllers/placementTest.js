const PlacementTest = require('../models/PlacementTest');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get placement test
// @route   GET /api/placement-test
// @access  Private
exports.getPlacementTest = asyncHandler(async (req, res, next) => {
  // const placementTest = await PlacementTest.findOne().select('-questions.correctAnswer');
  const placementTest = await PlacementTest.findOne()
  
  console.log("fetching placement test", placementTest); // Debug log

  if (!placementTest) {

    return next(new ErrorResponse('Placement test not found', 404));
  }

  res.status(200).json({
    success: true,
    data: placementTest
  });
});

// @desc    Submit placement test answers
// @route   POST /api/placement-test/submit
// @access  Private
exports.submitPlacementTest = asyncHandler(async (req, res, next) => {
  const { totalPoints, userId } = req.body;

  console.log('Received totalPoints:', totalPoints); // Debug log

  // Ensure totalPoints is a number and has a valid value
  const points = Number(totalPoints);
  if (isNaN(points)) {
    return next(new ErrorResponse('Invalid total points. Must be at least 30.', 400));
  }

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }
  
  // Determine the assigned level based on total points
  let assignedLevel;
  let availableLevels;
  
  if (points >= 55) {
    assignedLevel = 'B2';
    availableLevels = ['A1', 'A2', 'B1', 'B2'];
  } else if (points >= 46) {
    assignedLevel = 'B1';
    availableLevels = ['A1', 'A2', 'B1'];
  } else if (points >= 30) {
    assignedLevel = 'A2';
    availableLevels = ['A1', 'A2'];
  } else {
    assignedLevel = 'A1';
    availableLevels = ['A1'];
  }
  
  // Update user progress
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  user.progress.placementTestTaken = true;
  user.progress.currentLevel = assignedLevel;
  user.progress.availableLevels = availableLevels;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    data: {
      totalPoints: points,
      assignedLevel,
      availableLevels
    }
  });
}); 