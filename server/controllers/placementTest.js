const PlacementTest = require('../models/PlacementTest');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get placement test
// @route   GET /api/placement-test
// @access  Private
exports.getPlacementTest = asyncHandler(async (req, res, next) => {
  const placementTest = await PlacementTest.findOne().select('-questions.correctAnswer');
  
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
  const { answers } = req.body;
  
  if (!answers || !Array.isArray(answers)) {
    return next(new ErrorResponse('Please provide answers array', 400));
  }
  
  // Get the placement test
  const placementTest = await PlacementTest.findOne();
  
  if (!placementTest) {
    return next(new ErrorResponse('Placement test not found', 404));
  }
  
  // Calculate scores for each level
  const levelScores = {
    'A1': 0,
    'A2': 0,
    'B1': 0,
    'B2': 0
  };
  
  const levelQuestionCounts = {
    'A1': 0,
    'A2': 0,
    'B1': 0,
    'B2': 0
  };
  
  let totalScore = 0;
  let totalPoints = 0;
  
  // Process each answer
  answers.forEach(answer => {
    const question = placementTest.questions.find(q => q._id.toString() === answer.questionId);
    
    if (!question) return;
    
    const level = question.level;
    levelQuestionCounts[level] += question.points;
    
    // Check if answer is correct
    let isCorrect = false;
    
    switch (question.type) {
      case 'multiple-choice':
        isCorrect = question.correctAnswer === answer.answer;
        break;
      case 'fill-in-the-blank':
        isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
        break;
      case 'matching':
        isCorrect = JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(answer.answer.sort());
        break;
      case 'ordering':
        isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answer.answer);
        break;
      case 'categories':
        // Check if each item is in the correct category
        isCorrect = Object.keys(question.correctAnswer).every(category => {
          const correctItems = question.correctAnswer[category];
          const userItems = answer.answer[category] || [];
          return correctItems.length === userItems.length && 
                 correctItems.every(item => userItems.includes(item));
        });
        break;
    }
    
    // Add points to the level score if correct
    if (isCorrect) {
      levelScores[level] += question.points;
      totalScore += question.points;
    }
    
    totalPoints += question.points;
  });
  
  // Calculate percentage scores for each level
  Object.keys(levelScores).forEach(level => {
    if (levelQuestionCounts[level] > 0) {
      levelScores[level] = (levelScores[level] / levelQuestionCounts[level]) * 100;
    }
  });
  
  // Calculate overall score
  const overallScore = (totalScore / totalPoints) * 100;
  
  // Determine the assigned level based on scores
  let assignedLevel = 'A1';
  const thresholdPercentage = 70; // 70% correct to pass a level
  
  if (levelScores['B1'] >= thresholdPercentage) {
    assignedLevel = 'B2';
  } else if (levelScores['A2'] >= thresholdPercentage) {
    assignedLevel = 'B1';
  } else if (levelScores['A1'] >= thresholdPercentage) {
    assignedLevel = 'A2';
  }
  
  // Determine available levels (assigned level and below)
  const allLevels = ['A1', 'A2', 'B1', 'B2'];
  const assignedLevelIndex = allLevels.indexOf(assignedLevel);
  const availableLevels = allLevels.slice(0, assignedLevelIndex + 1);
  
  // Update user progress
  const user = await User.findById(req.user.id);
  
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
      overallScore,
      levelScores,
      assignedLevel,
      availableLevels
    }
  });
}); 