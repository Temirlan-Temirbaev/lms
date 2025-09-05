const express = require('express');
const multer = require('multer');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseLessons,
  getCourseTests,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getUsers,
  getUser,
  updateUser,
  uploadFile,
  deleteFile,
  listFiles,
  getFileInfo,
  listBuckets,
  getPlacementTests,
  getPlacementTest,
  createPlacementTest,
  updatePlacementTest,
  deletePlacementTest,
  addPlacementTestQuestion,
  updatePlacementTestQuestion,
  deletePlacementTestQuestion,
  getPlacementTestQuestion,
} = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Configure multer for memory storage (files will be uploaded to MinIO)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter - original filename:', file.originalname);
    console.log('Multer fileFilter - filename char codes:', [...file.originalname].map(c => c.charCodeAt(0)));
    
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed!'), false);
    }
  },
  // Add filename handling to preserve UTF-8 encoding
  onParseStart: (req, res, next) => {
    console.log('Multer parse start - headers:', req.headers);
    next();
  }
});

// Protect all routes and require admin role
router.use(protect);
// Temporarily disabled for development - uncomment to require admin role
// router.use(authorize('admin'));

// Placement Tests
router.route('/placement-tests').get(getPlacementTests);
router.route('/placement-tests').post(createPlacementTest);
router.route('/placement-tests/:id').get(getPlacementTest);
router.route('/placement-tests/:id').put(updatePlacementTest);
router.route('/placement-tests/:id').delete(deletePlacementTest);

// Placement Test Questions
router.route('/placement-tests/:id/questions').post(addPlacementTestQuestion);
router.route('/placement-tests/:id/questions/:questionId').get(getPlacementTestQuestion);
router.route('/placement-tests/:id/questions/:questionId').put(updatePlacementTestQuestion);
router.route('/placement-tests/:id/questions/:questionId').delete(deletePlacementTestQuestion);

// Course routes
router.route('/courses').get(getCourses);
router.route('/courses').post(createCourse);
router.route('/courses/:id').get(getCourse);
router.route('/courses/:id').put(updateCourse);
router.route('/courses/:id').delete(deleteCourse);

// Lesson routes
router.route('/courses/:id/lessons').get(getCourseLessons);
router.route('/lessons').post(createLesson);
router.route('/lessons/:id').get(getLesson);
router.route('/lessons/:id').put(updateLesson);
router.route('/lessons/:id').delete(deleteLesson);

// Test routes
router.route('/courses/:id/tests').get(getCourseTests);
router.route('/tests').post(createTest);
router.route('/tests/:id').get(getTest);
router.route('/tests/:id').put(updateTest);
router.route('/tests/:id').delete(deleteTest);

// User routes
router.route('/users').get(getUsers);
router.route('/users/:id').get(getUser);
router.route('/users/:id').put(updateUser);

// File upload routes
router.route('/upload').post(upload.single('file'), uploadFile);
router.route('/upload/:filename').delete(deleteFile);

// File management routes
router.route('/files').get(listFiles);
router.route('/files/:filename').get(getFileInfo);

// Debug route to list buckets
router.route('/buckets').get(listBuckets);

module.exports = router;