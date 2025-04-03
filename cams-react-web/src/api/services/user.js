import axiosInstance from '../axios';

/**
 * Get current user's profile information
 * @returns {Promise} Promise that resolves to user data
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/api/users/me');
  return response.data;
};

/**
 * Get user permissions and access levels
 * @returns {Promise} Promise that resolves to user permissions data
 */
export const getUserPermissions = async () => {
  const response = await axiosInstance.get('/api/users/permissions');
  return response.data;
};

/**
 * Update user profile information
 * @param {Object} userData - User data to update
 * @returns {Promise} Promise that resolves to updated user data
 */
export const updateUserProfile = async (userData) => {
  const response = await axiosInstance.put('/api/users/me', userData);
  return response.data;
};

/**
 * Get list of all users (admin only)
 * @param {Object} params - Query parameters for pagination and filtering
 * @returns {Promise} Promise that resolves to list of users
 */
export const getAllUsers = async (params) => {
  const response = await axiosInstance.get('/api/users', { params });
  return response.data;
};

/**
 * Update user permissions (admin only)
 * @param {string|number} userId - ID of user to update
 * @param {Object} permissions - Permission settings to apply
 * @returns {Promise} Promise that resolves to updated user permissions
 */
export const updateUserPermissions = async (userId, permissions) => {
  const response = await axiosInstance.put(`/api/users/${userId}/permissions`, permissions);
  return response.data;
};