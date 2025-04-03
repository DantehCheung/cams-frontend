import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredLevel, requiredPageBit = 0 }) => {
  // Get authentication state and functions from AuthContext
  const { isAuthenticated, hasPermission, isLoading } = useAuth();
  
  // Force authentication check logging on component mount and on any change
  useEffect(() => {
    console.log('ProtectedRoute mounted/updated - Authentication check running');
  }, [requiredLevel, requiredPageBit]);

  // Authentication check using secure context
  const authenticated = isAuthenticated();
  const hasAccess = hasPermission(requiredLevel, requiredPageBit);
  
  console.log('ProtectedRoute Check:', { 
    isAuthenticated: authenticated, 
    requiredLevel, 
    requiredPageBit,
    hasAccess,
    isLoading
  });
  
  // Show loading state if auth is still initializing
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }
  
  // Strict check - BOTH authentication and permissions must pass
  if (!authenticated || !hasAccess) {
    console.log('Authentication failed or insufficient permissions. Redirecting to login...');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
export default ProtectedRoute;