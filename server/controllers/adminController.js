const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const users = await User.find({ avgRating: { $gt: 0 } });
    const totalRatingSum = users.reduce((acc, user) => acc + user.avgRating, 0);
    const avgRating = users.length > 0 ? (totalRatingSum / users.length).toFixed(1) : 0;

    res.json({
      totalUsers,
      totalRides,
      totalBookings,
      avgRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/rides
exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('driverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/suspend
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.suspended = !user.suspended;
    await user.save();

    res.json({ message: `User ${user.suspended ? 'suspended' : 'unsuspended'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
