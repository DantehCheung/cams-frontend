// api/axios.js
import axios from 'axios';

const baseurl = `${window.location.origin.replace(':5173', ':8787')}/api/`;


// Create an Axios instance that directly connects to the SpringBoot backend
const axiosInstance = axios.create({
  baseURL: `${baseurl}`,  // Direct connection to SpringBoot server
  timeout: 10000,
  withCredentials: true, // Enable cookies for secure auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Global token variable (stored in memory, not localStorage)
let authToken = null;

// Function to set the auth token (called from AuthContext)
export const setAuthToken = (token) => {
  authToken = token;
  
  // When token is set, update axios default headers
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Request interceptor for auth token
axiosInstance.interceptors.request.use(config => {
  // Use token from memory instead of localStorage
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Response interceptor for handling token expiration and refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          'http://localhost:8787/api/refresh-token', 
          {}, 
          { withCredentials: true }
        );
        
        if (refreshResponse.data && refreshResponse.data.token) {
          // Update the token in memory
          setAuthToken(refreshResponse.data.token);
          
          // Retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear token (we'll handle redirect at component level)
        setAuthToken(null);
      }
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;