import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export function ProtectedRoute({ children }: {children: React.ReactNode;}) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-text-secondary">Loading session...</div>;
  }
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace />);


  }
  return <>{children}</>;
}
