const prisma = require('../config/db');

// POST /api/reviews
exports.createReview = async (req, res) => {
  const { rideId, rating, comment } = req.body;

  try {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const revieweeId = ride.driverId;

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { rideId, reviewerId: req.user.id }
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this ride' });
    }

    const review = await prisma.review.create({
      data: {
        rideId,
        reviewerId: req.user.id,
        revieweeId,
        rating: parseInt(rating),
        comment
      }
    });

    // Recalculate average rating for the driver
    const reviews = await prisma.review.findMany({
      where: { revieweeId }
    });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews) : 0;

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(1))
      }
    });

    res.status(201).json({ ...review, _id: review.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/driver/:userId
exports.getDriverReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.params.userId },
      include: {
        reviewer: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedReviews = reviews.map(r => ({
      ...r,
      _id: r.id,
      reviewerId: r.reviewer
    }));
    
    res.json(mappedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
