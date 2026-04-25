import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fromCity: '',
    toCity: '',
    date: '',
    time: '',
    totalSeats: 1,
    pricePerSeat: '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/my');
      setRides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/rides', form);
      setMessage('Ride posted successfully!');
      setForm({ fromCity: '', toCity: '', date: '', time: '', totalSeats: 1, pricePerSeat: '', notes: '' });
      fetchRides();
    } catch (error) {
      setMessage('Failed to post ride');
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/rides/${id}/cancel`);
      setMessage('Ride cancelled');
      fetchRides();
    } catch (error) {
      setMessage('Failed to cancel ride');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="mt-2 text-gray-600">Post new rides and manage your existing ones.</p>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Post a Ride</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">From City</label>
            <input required type="text" className="mt-1 input-field" value={form.fromCity} onChange={(e) => setForm({...form, fromCity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To City</label>
            <input required type="text" className="mt-1 input-field" value={form.toCity} onChange={(e) => setForm({...form, toCity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input required type="date" className="mt-1 input-field" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input required type="time" className="mt-1 input-field" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Seats (1-6)</label>
            <input required type="number" min="1" max="6" className="mt-1 input-field" value={form.totalSeats} onChange={(e) => setForm({...form, totalSeats: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Per Seat ($)</label>
            <input required type="number" min="0" step="0.01" className="mt-1 input-field" value={form.pricePerSeat} onChange={(e) => setForm({...form, pricePerSeat: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea className="mt-1 input-field" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}></textarea>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary w-full">Post Ride</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Rides</h2>
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.length === 0 ? <p className="text-gray-500 col-span-3">No rides posted yet.</p> : rides.map((ride) => (
              <div key={ride._id} className="bg-white shadow rounded-lg p-6 border-l-4 border-primary-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{ride.fromCity} → {ride.toCity}</h3>
                    <p className="text-sm text-gray-600">{format(new Date(ride.date), 'MMM d, yyyy')} at {ride.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ride.status === 'active' ? 'bg-green-100 text-green-800' : ride.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {ride.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p><strong>Seats Left:</strong> {ride.seatsLeft} / {ride.totalSeats}</p>
                  <p><strong>Price:</strong> ${ride.pricePerSeat}</p>
                </div>
                {ride.status === 'active' && (
                  <button onClick={() => handleCancel(ride._id)} className="mt-4 btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 text-sm w-full">
                    Cancel Ride
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
