const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Test = require('../models/Test');
const User = require('../models/User');
const { uploadFile: uploadFileToMinio, deleteFile, listFiles, getFileInfo } = require('../utils/minio');

// @desc    Get all courses (Admin)
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getCourses = async (req, res, next) => {
  try {
    // For admin, get ALL courses without filtering by level
    const courses = await Course.find().sort({ level: 1 });

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

// @desc    Get single course (Admin)
// @route   GET /api/admin/courses/:id
// @access  Private (Admin)
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id of ${req.params.id}`,
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

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private (Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await course.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get lessons for a course
// @route   GET /api/admin/courses/:id/lessons
// @access  Private (Admin)
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
// @route   GET /api/admin/courses/:id/tests
// @access  Private (Admin)
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
// @route   GET /api/admin/lessons/:id
// @access  Private (Admin)
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title level');

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

// @desc    Create new lesson
// @route   POST /api/admin/lessons
// @access  Private (Admin)
exports.createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/admin/lessons/:id
// @access  Private (Admin)
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/admin/lessons/:id
// @access  Private (Admin)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    await lesson.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single test
// @route   GET /api/admin/tests/:id
// @access  Private (Admin)
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate('course', 'title level');

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

// @desc    Create new test
// @route   POST /api/admin/tests
// @access  Private (Admin)
exports.createTest = async (req, res, next) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update test
// @route   PUT /api/admin/tests/:id
// @access  Private (Admin)
exports.updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete test
// @route   DELETE /api/admin/tests/:id
// @access  Private (Admin)
exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    await test.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single user (Admin)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

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

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Upload file to MinIO (Admin)
// @route   POST /api/admin/upload
// @access  Private (Admin)
exports.uploadFile = async (req, res, next) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      sanitizedFileName: req.body.filename,
      fileSize: req.file?.size,
      path: req.body.path
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Use sanitized filename from frontend, or sanitize on backend as fallback
    let sanitizedFileName = req.body.filename;
    if (!sanitizedFileName) {
      // Fallback sanitization on backend
      sanitizedFileName = req.file.originalname
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-zA-Z0-9._-]/g, "") // Remove special characters except dots, underscores and hyphens
        .replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    }

    console.log('Filename sanitization:', {
      original: req.file.originalname,
      fromFrontend: req.body.filename,
      final: sanitizedFileName
    });

    // Get the upload path from request body
    const uploadPath = req.body.path || '';
    console.log('Uploading to path:', uploadPath);

    const result = await uploadFileToMinio(req.file, undefined, uploadPath, sanitizedFileName);
    console.log('Upload result:', result);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          filename: result.filename,
          url: result.url,
          mimetype: result.mimetype,
          size: result.size
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete file from MinIO (Admin)
// @route   DELETE /api/admin/upload/:filename
// @access  Private (Admin)
exports.deleteFile = async (req, res, next) => {
  try {
    const result = await deleteFile(req.params.filename);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    List all files in MinIO (Admin)
// @route   GET /api/admin/files
// @access  Private (Admin)
exports.listFiles = async (req, res, next) => {
  try {
    const files = await listFiles();
    
    // Sort files by lastModified descending (newest first)
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get file info from MinIO (Admin)
// @route   GET /api/admin/files/:filename
// @access  Private (Admin)
exports.getFileInfo = async (req, res, next) => {
  try {
    const fileInfo = await getFileInfo(req.params.filename);
    
    res.status(200).json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
};

// @desc    List all buckets in MinIO (Admin) - Debug endpoint
// @route   GET /api/admin/buckets
// @access  Private (Admin)
exports.listBuckets = async (req, res, next) => {
  try {
    const { minioClient } = require('../utils/minio');
    const buckets = await minioClient.listBuckets();
    
    res.status(200).json({
      success: true,
      count: buckets.length,
      data: buckets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


