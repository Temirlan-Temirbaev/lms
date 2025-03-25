const express = require('express');
const { 
  getUserProgress, 
  getUser,
  updateUserLevel,
  updateUserSettings 
} = require('../controllers/users');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/progress').get(getUserProgress);
router.route('/me').get(getUser);
router.route('/level').put(updateUserLevel);
router.route('/settings').put(updateUserSettings);

module.exports = router;