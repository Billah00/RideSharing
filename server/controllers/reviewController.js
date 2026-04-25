const Review = require('../models/Review');
const User = require('../models/User');
const Ride = require('../models/Ride');

// POST /api/reviews
exports.createReview = async (req, res) => {
  const { rideId, rating, comment } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const revieweeId = ride.driverId;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ rideId, reviewerId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this ride' });
    }

    const review = await Review.create({
      rideId,
      reviewerId: req.user._id,
      revieweeId,
      rating,
      comment
    });

    // Recalculate average rating for the driver
    const reviews = await Review.find({ revieweeId });
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

    await User.findByIdAndUpdate(revieweeId, {
      totalReviews,
      avgRating: avgRating.toFixed(1)
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/driver/:userId
exports.getDriverReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
