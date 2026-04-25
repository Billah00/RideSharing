const Ride = require('../models/Ride');

// GET /api/rides?from=&to=&date=
exports.searchRides = async (req, res) => {
  const { from, to, date } = req.query;
  try {
    let query = { status: 'active', seatsLeft: { $gt: 0 } };

    if (from) query.fromCity = { $regex: new RegExp(from, 'i') };
    if (to) query.toCity = { $regex: new RegExp(to, 'i') };
    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDate };
    }

    const rides = await Ride.find(query)
      .populate('driverId', 'name avatar avgRating totalReviews')
      .sort({ pricePerSeat: 1, date: 1, time: 1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/rides
exports.postRide = async (req, res) => {
  const { fromCity, toCity, date, time, totalSeats, pricePerSeat, notes } = req.body;

  try {
    const ride = await Ride.create({
      driverId: req.user._id,
      fromCity,
      toCity,
      date,
      time,
      totalSeats,
      seatsLeft: totalSeats,
      pricePerSeat,
      notes,
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/rides/:id/cancel
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/rides/my
exports.getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user._id }).sort({ date: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
