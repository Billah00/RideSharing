const express = require('express');
const router = express.Router();
const { searchRides, postRide, cancelRide, getMyRides } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', searchRides);
router.post('/', protect, postRide);
router.get('/my', protect, getMyRides);
router.patch('/:id/cancel', protect, cancelRide);

module.exports = router;
