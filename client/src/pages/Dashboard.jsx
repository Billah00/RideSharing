import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DriverDashboard from '../components/DriverDashboard';
import PassengerDashboard from '../components/PassengerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  return <PassengerDashboard />;
};

export default Dashboard;
