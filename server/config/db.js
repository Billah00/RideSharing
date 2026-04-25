const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If it's a placeholder URI or explicitly requested
    if (!mongoUri || mongoUri.includes('cluster0.abcde')) {
      console.log('Using in-memory MongoDB for local testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      process.env.MONGO_URI = mongoUri; 
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      
      console.log('Seeding initial data for in-memory DB...');
      await seedData();
    } else {
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  const User = require('../models/User');
  const Ride = require('../models/Ride');
  const Booking = require('../models/Booking');
  const Review = require('../models/Review');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@test.com', passwordHash, role: 'admin' },
    { name: 'John Driver', email: 'driver1@test.com', passwordHash, role: 'driver', avatar: 'https://i.pravatar.cc/150?u=driver1' },
    { name: 'Jane Driver', email: 'driver2@test.com', passwordHash, role: 'driver', avatar: 'https://i.pravatar.cc/150?u=driver2' },
    { name: 'Alice Passenger', email: 'pass1@test.com', passwordHash, role: 'passenger', avatar: 'https://i.pravatar.cc/150?u=pass1' },
    { name: 'Bob Passenger', email: 'pass2@test.com', passwordHash, role: 'passenger', avatar: 'https://i.pravatar.cc/150?u=pass2' },
    { name: 'Charlie Passenger', email: 'pass3@test.com', passwordHash, role: 'passenger', avatar: 'https://i.pravatar.cc/150?u=pass3' },
  ]);

  const driver1Id = users[1]._id;
  const driver2Id = users[2]._id;
  const pass1Id = users[3]._id;
  const pass2Id = users[4]._id;
  const pass3Id = users[5]._id;

  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 2);
  
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 3);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  const rides = await Ride.insertMany([
    { driverId: driver1Id, fromCity: 'New York', toCity: 'Boston', date: futureDate1, time: '08:00 AM', totalSeats: 3, seatsLeft: 2, pricePerSeat: 40, notes: 'No smoking' },
    { driverId: driver1Id, fromCity: 'Boston', toCity: 'New York', date: futureDate2, time: '06:00 PM', totalSeats: 3, seatsLeft: 3, pricePerSeat: 40, notes: 'Quiet ride' },
    { driverId: driver2Id, fromCity: 'San Francisco', toCity: 'Los Angeles', date: futureDate1, time: '10:00 AM', totalSeats: 4, seatsLeft: 4, pricePerSeat: 60, notes: 'Will stop for lunch' },
    { driverId: driver2Id, fromCity: 'Los Angeles', toCity: 'San Diego', date: pastDate, time: '09:00 AM', totalSeats: 3, seatsLeft: 1, pricePerSeat: 30, status: 'completed' },
    { driverId: driver1Id, fromCity: 'New York', toCity: 'Philadelphia', date: futureDate1, time: '07:00 AM', totalSeats: 2, seatsLeft: 0, pricePerSeat: 25, status: 'full' },
  ]);

  await Booking.insertMany([
    { rideId: rides[0]._id, passengerId: pass1Id, status: 'confirmed' },
    { rideId: rides[3]._id, passengerId: pass2Id, status: 'confirmed' },
    { rideId: rides[3]._id, passengerId: pass3Id, status: 'confirmed' },
    { rideId: rides[4]._id, passengerId: pass1Id, status: 'confirmed' },
  ]);

  await Review.insertMany([
    { rideId: rides[3]._id, reviewerId: pass2Id, revieweeId: driver2Id, rating: 5, comment: 'Great driver, very safe.' },
    { rideId: rides[3]._id, reviewerId: pass3Id, revieweeId: driver2Id, rating: 4, comment: 'Good ride, slightly delayed.' },
  ]);

  await User.findByIdAndUpdate(driver2Id, { avgRating: 4.5, totalReviews: 2 });
  console.log('In-memory DB seeded successfully!');
};

module.exports = connectDB;
