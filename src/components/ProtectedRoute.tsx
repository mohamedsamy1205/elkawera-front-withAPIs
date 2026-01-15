
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
