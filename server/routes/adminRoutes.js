const express = require('express');
const router = express.Router();
const { getStats, getUsers, getRides, suspendUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.get('/rides', protect, admin, getRides);
router.patch('/users/:id/suspend', protect, admin, suspendUser);

module.exports = router;
