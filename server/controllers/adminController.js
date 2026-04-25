const prisma = require('../config/db');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRides = await prisma.ride.count();
    const totalBookings = await prisma.booking.count();
    
    const usersWithRating = await prisma.user.findMany({
      where: { avgRating: { gt: 0 } }
    });
    const totalRatingSum = usersWithRating.reduce((acc, user) => acc + user.avgRating, 0);
    const avgRating = usersWithRating.length > 0 ? (totalRatingSum / usersWithRating.length).toFixed(1) : 0;

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
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        avgRating: true,
        totalReviews: true,
        suspended: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Map id to _id for frontend compatibility
    const mappedUsers = users.map(user => ({ ...user, _id: user.id }));
    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/rides
exports.getRides = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: { name: true, email: true }
        }
      }
    });
    
    // Map id to _id and driver to driverId for frontend compatibility
    const mappedRides = rides.map(ride => ({
      ...ride,
      _id: ride.id,
      driverId: ride.driver
    }));
    res.json(mappedRides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/suspend
exports.suspendUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended: !user.suspended }
    });

    res.json({ 
      message: `User ${updatedUser.suspended ? 'suspended' : 'unsuspended'} successfully`, 
      user: { ...updatedUser, _id: updatedUser.id } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
