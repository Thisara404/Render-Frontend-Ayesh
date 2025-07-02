import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state if still checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // If roles are specified and user doesn't have the required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'user') {
      return <Navigate to="/bookings" replace />;
    } else if (user.role === 'photographer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;