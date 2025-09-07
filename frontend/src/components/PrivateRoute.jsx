import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import our auth hook

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth(); // Get current user and loading state

  // If still checking auth state, don't render anything yet
  if (loading) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Loading authentication...</div>; 
  }

  // If there's a user, render the child routes (Outlet)
  // Otherwise, redirect to the login page
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;