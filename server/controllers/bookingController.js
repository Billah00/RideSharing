const prisma = require('../config/db');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const { rideId } = req.body;

  try {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.seatsLeft <= 0 || ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is full or not active' });
    }

    // Check if user already booked
    const existingBooking = await prisma.booking.findFirst({
      where: { 
        rideId, 
        passengerId: req.user.id,
        status: { not: 'cancelled' } 
      }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this ride' });
    }

    // Transaction to ensure seatsLeft doesn't go below zero concurrently
    const [booking, updatedRide] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          rideId,
          passengerId: req.user.id,
          status: 'confirmed'
        }
      }),
      prisma.ride.update({
        where: { id: rideId },
        data: {
          seatsLeft: ride.seatsLeft - 1,
          status: ride.seatsLeft - 1 === 0 ? 'full' : ride.status
        }
      })
    ]);

    res.status(201).json({ ...booking, _id: booking.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { passengerId: req.user.id },
      include: {
        ride: {
          include: {
            driver: {
              select: { name: true, avatar: true, avgRating: true }
            }
          }
        }
      },
      orderBy: { bookedAt: 'desc' }
    });
    
    const mappedBookings = bookings.map(b => ({
      ...b,
      _id: b.id,
      rideId: { ...b.ride, _id: b.ride.id, driverId: b.ride.driver }
    }));
    
    res.json(mappedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { ride: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.passengerId !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const [updatedBooking, updatedRide] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: req.params.id },
        data: { status: 'cancelled' }
      }),
      prisma.ride.update({
        where: { id: booking.rideId },
        data: {
          seatsLeft: booking.ride.seatsLeft + 1,
          status: booking.ride.status === 'full' ? 'active' : booking.ride.status
        }
      })
    ]);

    res.json({ ...updatedBooking, _id: updatedBooking.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
