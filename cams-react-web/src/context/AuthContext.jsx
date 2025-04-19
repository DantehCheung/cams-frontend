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
    // add refreshToken
    refreshToken: null,
    accessLevel: null,
    accessPage: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state when component loads
  useEffect(() => {
    // Set loading to false on initial load
    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Login function - stores token in memory only
  const login = async (credentials) => {
    try {
      // Configure to handle cookies
      const response = await axiosInstance.post('loginbypw', credentials, {
        withCredentials: true, // Important for receiving HTTP-only cookies
      });
      
      if (response.data && !response.data.errorCode) {
        const { token, refreshToken,accessLevel, accessPage, firstName, lastName, lastLoginIp } = response.data;
        const numericAccessLevel = Number(accessLevel);
        
        // Store the access token in memory only
        setAuthState({
          token,
          refreshToken,
          // Store refreshToken in memory
          accessLevel: numericAccessLevel,
          accessPage: Number(accessPage),
          user: { firstName, lastName, lastLoginIp },
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Set token for API requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Determine redirect path based on user role
        let redirectPath = '/home';
        
        // If user is a student, redirect to borrow page
        if (numericAccessLevel === ACCESS_LEVELS.STUDENT) {
          redirectPath = '/br/borrow';
        }
        
        return { 
          success: true,
          redirectPath: redirectPath 
        };
      } else {
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };

  // Card Login function - uses card ID to authenticate
  const loginByCard = async (cardId) => {
    try {
      // Configure to handle cookies
      const response = await axiosInstance.post('loginbycard', { CardID: cardId }, {
        withCredentials: true, // Important for receiving HTTP-only cookies
      });
      
      if (response.data && !response.data.errorCode) {
        const { token, refreshToken, accessLevel, accessPage, firstName, lastName, lastLoginIp } = response.data;
        const numericAccessLevel = Number(accessLevel);
        
        // Store the access token in memory only
        setAuthState({
          token,
          refreshToken,
          accessLevel: numericAccessLevel,
          accessPage: Number(accessPage),
          user: { firstName, lastName, lastLoginIp },
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Set token for API requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Determine redirect path based on user role
        let redirectPath = '/home';
        
        // If user is a student, redirect to borrow page
        if (numericAccessLevel === ACCESS_LEVELS.STUDENT) {
          redirectPath = '/br/borrow';
        }
        
        return { 
          success: true,
          redirectPath: redirectPath 
        };
      } else {
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error("Card login error:", error);
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axiosInstance.post('logout', {}, {
        withCredentials: true, // Important for cookies
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear auth state from memory
      setAuthState({
        token: null,
        refreshToken: null,
        // Clear refreshToken from memory
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
    
    // This original teacher override is now handled in the hasPermission function
    return hasPermission;
  };

  const hasPermission = (requiredLevel, requiredPageBit = 0) => {
    // Check authentication
    if (!authState.isAuthenticated) return false;
    
    // ADMIN (accessLevel = 0) can access all pages
    if (authState.accessLevel === ACCESS_LEVELS.ADMIN) {
      console.log('Admin override - full access granted');
      return true;
    }
    
    // TEACHER (accessLevel = 100) can access all pages except Add User
    if (authState.accessLevel === ACCESS_LEVELS.TEACHER) {
      // Block access to User Management for teachers
      if (requiredPageBit === PAGE_PERMISSIONS.USER_MANAGEMENT) {
        console.log('Teacher restricted from User Management');
        return false;
      }
      
      // Grant access to all other pages for teachers
      console.log('Teacher override - access granted except User Management');
      return true;
    }
    
    // STUDENT (accessLevel = 1000) can only access specific pages
    if (authState.accessLevel === ACCESS_LEVELS.STUDENT) {
      const allowedStudentPages = [
        PAGE_PERMISSIONS.RETURN,
        PAGE_PERMISSIONS.BORROW,
        PAGE_PERMISSIONS.RFID,
        PAGE_PERMISSIONS.USER_INFO,
        0 // For pages with no specific permission bit (like downloadVer)
      ];
      
      if (allowedStudentPages.includes(requiredPageBit)) {
        console.log('Student access granted to allowed page');
        return true;
      } else {
        console.log('Student access denied to restricted page');
        return false;
      }
    }
    
    // For other access levels, fall back to the original permission checks
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
  const getRefreshToken = () => authState.refreshToken;

  // Provide the auth context value
  const authContextValue = {
    ...authState,
    login,
    loginByCard,
    logout,
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

