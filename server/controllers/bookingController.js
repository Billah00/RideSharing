const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const { rideId } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.seatsLeft <= 0 || ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is full or not active' });
    }

    // Check if user already booked
    const existingBooking = await Booking.findOne({ rideId, passengerId: req.user._id, status: { $ne: 'cancelled' } });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this ride' });
    }

    const booking = await Booking.create({
      rideId,
      passengerId: req.user._id,
      status: 'confirmed' // Or pending based on rules, going with confirmed for prototype
    });

    // Update ride seats
    ride.seatsLeft -= 1;
    if (ride.seatsLeft === 0) {
      ride.status = 'full';
    }
    await ride.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: 'rideId',
        populate: { path: 'driverId', select: 'name avatar avgRating' }
      })
      .sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('rideId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.passengerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Increment ride seats
    const ride = booking.rideId;
    if (ride) {
      ride.seatsLeft += 1;
      if (ride.status === 'full') {
        ride.status = 'active';
      }
      await ride.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
