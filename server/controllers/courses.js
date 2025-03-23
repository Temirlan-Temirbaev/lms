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
    console.log(req?.user, req?.body, "req");
    const user = await User.findById(req.user.id);
    console.log(user, "user");
    const availableLevels = user.progress.availableLevels;
    console.log(availableLevels, "availableLevels");
    // Get courses that match the user's available levels
    const courses = await Course.find({ level: { $in: availableLevels } }).sort({ level: 1 });

    console.log(courses, "courses");
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    console.log(err);
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

    const { totalPoints, isFinal } = req.body;

    // Validate totalPoints
    const points = Number(totalPoints);
    if (isNaN(points) || points < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total points provided',
      });
    }

    // Calculate percentage score
    const totalPossiblePoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = (points / totalPossiblePoints) * 100;

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

    // Handle final test and level progression
    if (isFinal && percentageScore >= 85) {
      // Get the course for this test
      const course = await Course.findById(test.course);
      
      // Check if user is at B2 level
      if (user.progress.currentLevel === 'B2') {
        // User has completed all levels, just congratulate them
        user.progress.allLevelsCompleted = true;
      } else {
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
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        score: percentageScore,
        totalPoints: points,
        totalPossiblePoints,
        passed: percentageScore >= test.passingScore,
        isFinal,
        allLevelsCompleted: user.progress.allLevelsCompleted,
        newLevel: isFinal && percentageScore >= 85 ? user.progress.currentLevel : null
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