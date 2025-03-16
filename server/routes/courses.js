const express = require('express');
const {
  getCourses,
  getCourse,
  getCourseLessons,
  getCourseTests,
  getLesson,
  getTest,
  submitTest,
  completeLesson,
} = require('../controllers/courses');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/').get(getCourses);
router.route('/:id').get(getCourse);
router.route('/:id/lessons').get(getCourseLessons);
router.route('/:id/tests').get(getCourseTests);
router.route('/lessons/:id').get(getLesson);
router.route('/lessons/:id/complete').post(completeLesson);
router.route('/tests/:id').get(getTest);
router.route('/tests/:id/submit').post(submitTest);

module.exports = router; 