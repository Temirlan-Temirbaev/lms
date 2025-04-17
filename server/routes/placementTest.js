const express = require('express');
const {
  getPlacementTest,
  submitPlacementTest
} = require('../controllers/placementTest');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
// router.use(protect);

router.get('/', getPlacementTest);
router.post('/submit', submitPlacementTest);

module.exports = router; 