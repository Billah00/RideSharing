const express = require('express');
const router = express.Router();
const { createReview, getDriverReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/driver/:userId', getDriverReviews);

module.exports = router;
