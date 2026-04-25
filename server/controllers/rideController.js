const prisma = require('../config/db');

// GET /api/rides?from=&to=&date=
exports.searchRides = async (req, res) => {
  const { from, to, date } = req.query;
  try {
    let whereClause = { status: 'active', seatsLeft: { gt: 0 } };

    if (from) whereClause.fromCity = { contains: from, mode: 'insensitive' };
    if (to) whereClause.toCity = { contains: to, mode: 'insensitive' };
    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      whereClause.date = { gte: searchDate, lt: nextDate };
    }

    const rides = await prisma.ride.findMany({
      where: whereClause,
      include: {
        driver: {
          select: { name: true, avatar: true, avgRating: true, totalReviews: true }
        }
      },
      orderBy: [
        { pricePerSeat: 'asc' },
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

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

// POST /api/rides
exports.postRide = async (req, res) => {
  const { fromCity, toCity, date, time, totalSeats, pricePerSeat, notes } = req.body;

  try {
    const ride = await prisma.ride.create({
      data: {
        driverId: req.user.id,
        fromCity,
        toCity,
        date: new Date(date),
        time,
        totalSeats: parseInt(totalSeats),
        seatsLeft: parseInt(totalSeats),
        pricePerSeat: parseFloat(pricePerSeat),
        notes,
      }
    });

    res.status(201).json({ ...ride, _id: ride.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/rides/:id/cancel
exports.cancelRide = async (req, res) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id }
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const updatedRide = await prisma.ride.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    });

    res.json({ ...updatedRide, _id: updatedRide.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/rides/my
exports.getMyRides = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where: { driverId: req.user.id },
      orderBy: { date: 'desc' }
    });
    
    const mappedRides = rides.map(ride => ({ ...ride, _id: ride.id }));
    res.json(mappedRides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
