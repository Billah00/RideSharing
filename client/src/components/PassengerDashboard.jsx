import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { Star, Search, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

const PassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '' });
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rideId: null, rating: 5, comment: '' });

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get('/rides', { params: searchParams });
      setRides(data);
    } catch (error) {
      setMessage('Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (error) {
      setMessage('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId) => {
    try {
      await api.post('/bookings', { rideId });
      setMessage('Seat booked successfully!');
      handleSearch(); // refresh
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to book ride');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage('Booking cancelled');
      fetchBookings();
    } catch (error) {
      setMessage('Failed to cancel booking');
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', ratingData);
      setMessage('Review submitted!');
      setShowRatingModal(false);
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Passenger Dashboard</h1>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'search' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('search')}
        >
          Search Rides
        </button>
        <button
          className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'bookings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
      </div>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          {message}
          <button onClick={() => setMessage('')} className="absolute top-0 bottom-0 right-0 px-4 py-3">×</button>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">From</label>
              <input type="text" className="mt-1 input-field" value={searchParams.from} onChange={(e) => setSearchParams({...searchParams, from: e.target.value})} placeholder="City" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">To</label>
              <input type="text" className="mt-1 input-field" value={searchParams.to} onChange={(e) => setSearchParams({...searchParams, to: e.target.value})} placeholder="City" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" className="mt-1 input-field" value={searchParams.date} onChange={(e) => setSearchParams({...searchParams, date: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary w-full md:w-auto h-[42px]">
              <Search className="w-4 h-4 mr-2" /> Search
            </button>
          </form>

          {loading ? <p>Searching...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <Car className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No rides found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                </div>
              ) : rides.map(ride => (
                <div key={ride._id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border-t-4 border-primary-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <img src={ride.driverId.avatar || 'https://via.placeholder.com/150'} alt="driver" className="h-10 w-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ride.driverId.name}</p>
                      <div className="flex items-center text-xs text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="ml-1 text-gray-600">{ride.driverId.avgRating} ({ride.driverId.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {ride.fromCity} → {ride.toCity}</p>
                    <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {format(new Date(ride.date), 'MMM d, yyyy')}</p>
                    <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {ride.time}</p>
                    <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> ${ride.pricePerSeat} per seat</p>
                    <p className="text-xs bg-gray-100 p-2 rounded mt-2">{ride.seatsLeft} seats left</p>
                  </div>
                  <button 
                    onClick={() => handleBook(ride._id)} 
                    disabled={ride.seatsLeft === 0}
                    className={`mt-4 w-full ${ride.seatsLeft === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                  >
                    {ride.seatsLeft === 0 ? 'Full' : 'Book Seat'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {loading ? <p>Loading...</p> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.length === 0 ? <p>No bookings found.</p> : bookings.map(booking => {
                const rideDate = new Date(booking.rideId?.date);
                const isPast = rideDate < new Date();

                return (
                  <div key={booking._id} className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">Booked {format(new Date(booking.bookedAt), 'MMM d, yyyy')}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{booking.rideId?.fromCity} → {booking.rideId?.toCity}</h3>
                      <p className="text-sm text-gray-600 mb-4">{format(rideDate, 'MMM d, yyyy')} at {booking.rideId?.time}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        <img src={booking.rideId?.driverId?.avatar || 'https://via.placeholder.com/150'} className="h-8 w-8 rounded-full" alt="driver" />
                        <span>Driver: <strong>{booking.rideId?.driverId?.name}</strong></span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      {booking.status !== 'cancelled' && !isPast && (
                        <button onClick={() => handleCancelBooking(booking._id)} className="btn-outline text-red-600 w-full text-sm">
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'confirmed' && isPast && (
                        <button onClick={() => { setRatingData({ ...ratingData, rideId: booking.rideId._id }); setShowRatingModal(true); }} className="btn-primary w-full text-sm">
                          Rate Driver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Rate Your Ride</h2>
            <form onSubmit={handleRateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Rating (1-5)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button type="button" key={num} onClick={() => setRatingData({...ratingData, rating: num})} className={`p-2 rounded-full ${ratingData.rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}>
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Comment (Optional)</label>
                <textarea maxLength="200" className="input-field w-full" rows="3" value={ratingData.comment} onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}></textarea>
                <p className="text-xs text-gray-500 text-right">{ratingData.comment.length}/200</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowRatingModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple Car icon component since it might not be imported correctly if I missed it
const Car = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0ZM3 16a2 2 0 1 0 4 0a2 2 0 0 0-4 0Z"/></svg>
);

export default PassengerDashboard;
