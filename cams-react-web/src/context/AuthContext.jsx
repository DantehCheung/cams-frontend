import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { ACCESS_LEVELS, PAGE_PERMISSIONS } from '../api';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  // State to hold the authentication data in memory (not localStorage)
  const [authState, setAuthState] = useState({
    token: null,
    accessLevel: null,
    accessPage: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check if user is already logged in via refresh token when app loads
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to refresh token on startup to check if user is authenticated
        const response = await axiosInstance.post('/api/refresh-token', {}, {
          withCredentials: true, // Important for cookies
        });
        
        if (response.data && !response.data.errorCode) {
          // Set the new auth data in memory
          const { token, accessLevel, accessPage, firstName, lastName, lastLoginIp } = response.data;
          
          // Update auth state with the new token and user info
          setAuthState({
            token,
            accessLevel: Number(accessLevel),
            accessPage: Number(accessPage),
            user: { firstName, lastName, lastLoginIp },
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Set token in axios default headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          // Not authenticated
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Login function - stores token in memory only
  const login = async (credentials) => {
    try {
      // Configure to handle cookies
      const response = await axiosInstance.post('/api/loginbypw', credentials, {
        withCredentials: true, // Important for receiving HTTP-only cookies
      });
      
      if (response.data && !response.data.errorCode) {
        const { token, accessLevel, accessPage, firstName, lastName, lastLoginIp } = response.data;
        
        // Store the access token in memory only
        setAuthState({
          token,
          accessLevel: Number(accessLevel),
          accessPage: Number(accessPage),
          user: { firstName, lastName, lastLoginIp },
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Set token for API requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { success: true };
      } else {
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axiosInstance.post('/api/logout', {}, {
        withCredentials: true, // Important for cookies
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state from memory
      setAuthState({
        token: null,
        accessLevel: null,
        accessPage: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Remove token from axios headers
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  // Check for token expiration and refresh if needed
  const refreshToken = async () => {
    try {
      const response = await axiosInstance.post('/api/refresh-token', {}, {
        withCredentials: true,
      });
      
      if (response.data && !response.data.errorCode) {
        const { token } = response.data;
        
        // Update only the token in the auth state
        setAuthState(prev => ({
          ...prev,
          token,
        }));
        
        // Update axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  // Permission check functions
  const hasRolePermission = (requiredLevel) => {
    if (!authState.isAuthenticated) return false;
    return authState.accessLevel <= requiredLevel;
  };

  const hasPagePermission = (pagePermission) => {
    if (!authState.isAuthenticated) return false;
    
    // For debugging
    const hasPermission = (authState.accessPage & pagePermission) !== 0;
    console.log(`Page Permission Check: Required=${pagePermission}, User=${authState.accessPage}, Result=${hasPermission}`);
    
    // For teachers, grant access to campus, room, and item management
    if (authState.accessLevel <= ACCESS_LEVELS.TEACHER) {
      const managementPermissions = 
        PAGE_PERMISSIONS.CAMPUS_MANAGEMENT | 
        PAGE_PERMISSIONS.ROOM_MANAGEMENT | 
        PAGE_PERMISSIONS.ITEM_MANAGEMENT;
      
      if ((pagePermission & managementPermissions) !== 0) {
        console.log('Teacher override for management pages granted');
        return true;
      }
    }
    
    return hasPermission;
  };

  const hasPermission = (requiredLevel, requiredPageBit = 0) => {
    // Check authentication
    if (!authState.isAuthenticated) return false;
    
    // Check role permission
    if (!hasRolePermission(requiredLevel)) return false;
    
    // Check page permission (if required)
    if (requiredPageBit !== 0 && !hasPagePermission(requiredPageBit)) return false;
    
    return true;
  };

  // Authentication helper
  const isAuthenticated = () => {
    return authState.isAuthenticated && !!authState.token;
  };

  // Access level and page helpers
  const getAccessLevel = () => authState.accessLevel;
  const getAccessPage = () => authState.accessPage;
  const getUserInfo = () => authState.user;

  // Provide the auth context value
  const authContextValue = {
    ...authState,
    login,
    logout,
    refreshToken,
    hasPermission,
    isAuthenticated,
    getAccessLevel,
    getAccessPage,
    getUserInfo,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
