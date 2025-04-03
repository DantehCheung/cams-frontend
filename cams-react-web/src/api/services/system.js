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

/**
 * Get dashboard data for the home page
 * @returns {Promise} Promise that resolves to dashboard data
 */
export const getData = async () => {
  try {
    // Try to fetch from backend if endpoint exists
    const response = await axiosInstance.get('/api/dashboard/data');
    return response.data;
  } catch (error) {
    console.log('Using mock data for dashboard since API endpoint is not available');
    // Return mock data structure that matches what the home page expects
    return {
      data: {
        detailedAssetTableData: [
          {
            campus: 'Main Campus',
            item: 'Laptop',
            part: 'Computer',
            price: 1200.00,
            purchaseDate: '2025-01-15',
            quantity: 5,
            room: 'IT Lab',
            uniqueId: 'LP-2025-001'
          },
          {
            campus: 'Science Building',
            item: 'Projector',
            part: 'AV Equipment',
            price: 800.00,
            purchaseDate: '2024-12-10',
            quantity: 2,
            room: 'Lecture Hall',
            uniqueId: 'PR-2024-005'
          }
        ]
      }
    };
  }
};