const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Test = require('../models/Test');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    // Get user's available levels
    const user = await User.findById(req.user.id);
    const availableLevels = user.progress.availableLevels;
    
    // Get courses that match the user's available levels
    const courses = await Course.find({ level: { $in: availableLevels } }).sort({ level: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'lessons',
        select: 'title order',
        options: { sort: { order: 1 } },
      })
      .populate({
        path: 'tests',
        select: 'title description order',
        options: { sort: { order: 1 } },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id of ${req.params.id}`,
      });
    }

    // Check if user has access to this course level
    const user = await User.findById(req.user.id);
    if (!user.progress.availableLevels.includes(course.level)) {
      return res.status(403).json({
        success: false,
        message: `You don't have access to ${course.level} level courses. Please complete the placement test or lower level courses first.`,
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get lessons for a course
// @route   GET /api/courses/:id/lessons
// @access  Private
exports.getCourseLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get tests for a course
// @route   GET /api/courses/:id/tests
// @access  Private
exports.getCourseTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ course: req.params.id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single lesson
// @route   GET /api/courses/lessons/:id
// @access  Private
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: `Lesson not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single test
// @route   GET /api/courses/tests/:id
// @access  Private
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: `Test not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Submit test answers
// @route   POST /api/courses/tests/:id/submit
// @access  Private
exports.submitTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: `Test not found with id of ${req.params.id}`,
      });
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length !== test.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide answers for all questions',
      });
    }

    // Calculate score
    let score = 0;
    const results = test.questions.map((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      // Check if answer is correct based on question type
      switch (question.type) {
        case 'multiple-choice':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case 'matching':
          // For matching questions, check if each match is correct
          if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer) && 
              userAnswer.length === question.correctAnswer.length) {
            // Compare each answer, ignoring case sensitivity
            isCorrect = userAnswer.every((answer, i) => 
              answer.toLowerCase() === question.correctAnswer[i].toLowerCase());
          }
          break;
        case 'ordering':
          isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
          break;
        case 'categories':
          // For categories questions, check if each item is in the correct category
          if (typeof userAnswer === 'object' && typeof question.correctAnswer === 'object' && 
              !Array.isArray(userAnswer) && !Array.isArray(question.correctAnswer)) {
            
            // Get all categories from the correct answer
            const categories = Object.keys(question.correctAnswer);
            
            // Check if all categories are present in the user answer
            const hasAllCategories = categories.every(category => 
              userAnswer.hasOwnProperty(category) && Array.isArray(userAnswer[category]));
            
            if (hasAllCategories) {
              // Check if each item is in the correct category
              const allItemsCorrect = categories.every(category => {
                const correctItems = question.correctAnswer[category];
                const userItems = userAnswer[category];
                
                // Check if all correct items for this category are in the user's answer
                return correctItems.every(item => userItems.includes(item)) && 
                       // Check if all user items for this category are correct
                       userItems.every(item => correctItems.includes(item));
              });
              
              isCorrect = allItemsCorrect;
            }
          }
          break;
        case 'fill-in-blanks':
          // For fill-in-blanks, allow for multiple possible answers and trim whitespace
          if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
            // Single blank, single possible answer
            isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
          } else if (typeof userAnswer === 'string' && Array.isArray(question.correctAnswer)) {
            // Single blank, multiple possible answers
            isCorrect = question.correctAnswer.some(answer => 
              userAnswer.toLowerCase().trim() === answer.toLowerCase().trim());
          } else if (typeof userAnswer === 'object' && typeof question.correctAnswer === 'object' && 
                    !Array.isArray(question.correctAnswer) && !Array.isArray(userAnswer)) {
            // Multiple blanks
            const blankIds = Object.keys(question.correctAnswer);
            isCorrect = blankIds.every(blankId => {
              const correctAnswerForBlank = question.correctAnswer[blankId];
              const userAnswerForBlank = userAnswer[blankId];
              
              if (!userAnswerForBlank) return false;
              
              if (typeof correctAnswerForBlank === 'string') {
                return userAnswerForBlank.toLowerCase().trim() === correctAnswerForBlank.toLowerCase().trim();
              } else if (Array.isArray(correctAnswerForBlank)) {
                return correctAnswerForBlank.some(answer => 
                  userAnswerForBlank.toLowerCase().trim() === answer.toLowerCase().trim());
              }
              return false;
            });
          }
          break;
        case 'input':
          if (typeof userAnswer === 'string' && typeof question.correctAnswer === 'string') {
            isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
          } else if (Array.isArray(question.correctAnswer)) {
            // If correctAnswer is an array of possible answers
            isCorrect = question.correctAnswer.some(answer => 
              userAnswer.toLowerCase().trim() === answer.toLowerCase().trim());
          }
          break;
        default:
          isCorrect = false;
      }

      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: question._id,
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        question: question.question,
        questionType: question.type
      };
    });

    // Calculate percentage score
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = (score / totalPoints) * 100;

    // Update user progress
    const user = await User.findById(req.user.id);
    
    // Check if test already completed
    const testIndex = user.progress.completedTests.findIndex(
      (t) => t.testId.toString() === test._id.toString()
    );

    if (testIndex !== -1) {
      // Update existing test score if new score is higher
      if (percentageScore > user.progress.completedTests[testIndex].score) {
        user.progress.completedTests[testIndex].score = percentageScore;
        user.progress.completedTests[testIndex].completedAt = Date.now();
      }
    } else {
      // Add new test to completed tests
      user.progress.completedTests.push({
        testId: test._id,
        score: percentageScore,
        completedAt: Date.now(),
      });
    }

    // Check if this is a final test for a level and if the user passed with a high score
    if (test.isFinal && percentageScore >= 85) {
      // Get the course for this test
      const course = await Course.findById(test.course);
      
      // Check if there's a next level to unlock
      const currentLevelIndex = ['A1', 'A2', 'B1', 'B2'].indexOf(course.level);
      if (currentLevelIndex < 3) { // If not already at the highest level (B2)
        const nextLevel = ['A1', 'A2', 'B1', 'B2'][currentLevelIndex + 1];
        
        // Check if the next level is not already available
        if (!user.progress.availableLevels.includes(nextLevel)) {
          user.progress.availableLevels.push(nextLevel);
          user.progress.currentLevel = nextLevel; // Update current level to the new level
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        score: percentageScore,
        totalPoints,
        earnedPoints: score,
        results,
        passed: percentageScore >= test.passingScore,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/courses/lessons/:id/complete
// @access  Private
exports.completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: `Lesson not found with id of ${req.params.id}`,
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if lesson already completed
    if (!user.progress.completedLessons.includes(lesson._id)) {
      user.progress.completedLessons.push(lesson._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user.progress,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}; 