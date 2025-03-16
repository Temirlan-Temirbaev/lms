const express = require('express');
const { getUserProgress, updateUserLevel } = require('../controllers/users');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/progress').get(getUserProgress);
router.route('/level').put(updateUserLevel);

module.exports = router; 