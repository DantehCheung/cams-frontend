import axiosInstance from '../axios';

/**
 * Get application menu structure based on user permissions
 * @returns {Promise} Promise that resolves to menu structure
 */
export const getMenu = async () => {
  const response = await axiosInstance.get('/api/menu');
  return response.data;
};

/**
 * Get system settings and configuration
 * @returns {Promise} Promise that resolves to system settings
 */
export const getSystemSettings = async () => {
  const response = await axiosInstance.get('/api/settings');
  return response.data;
};

/**
 * Update system settings (admin only)
 * @param {Object} settings - Settings to update
 * @returns {Promise} Promise that resolves to updated settings
 */
export const updateSystemSettings = async (settings) => {
  const response = await axiosInstance.put('/api/settings', settings);
  return response.data;
};

/**
 * Get application version and build information
 * @returns {Promise} Promise that resolves to version information
 */
export const getVersionInfo = async () => {
  const response = await axiosInstance.get('/api/version');
  return response.data;
};

/**
 * Get system health status (admin only)
 * @returns {Promise} Promise that resolves to health status
 */
export const getHealthStatus = async () => {
  const response = await axiosInstance.get('/api/health');
  return response.data;
};

/**
 * Get current user information from localStorage
 * @returns {Object} User information object or null if not available
 */
export const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  }
  return null;
};

