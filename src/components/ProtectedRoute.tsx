
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profileEndpoint } from '@/types/APIs';

export const ProtectedRoute: React.FC = () => {
  // const { user, loading } = useAuth();

  let user = JSON.parse(localStorage.getItem('profile')) || {};
  // console.log('ProtectedRoute - current user:', user);
  // if (loading) return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
