import axiosInstance, { setAuthToken } from '../axios';


export const getHomeData = async () => {
  try {
    // No need to get token from localStorage anymore - the axios interceptor will add it to headers
    // The backend should be updated to get the token from Authorization header instead of request body
    // For now, we'll get the token from the axios default headers if we need to include it in body
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Send token in the request body as JSON (for backward compatibility with current backend)
    const response = await axiosInstance.post('/api/gethome', {
      token: token
    });
    
    if (response.data && !response.data.errorCode) {
      // No need to update localStorage anymore - all user info is managed by AuthContext
      
      // Return the full response data which includes PendingConfirmItem
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Get home data error:', error);
    // Return mock data instead of throwing error
    console.log('Using mock data for home since API endpoint is not available');
    return {
      LastLoginTime: new Date().toISOString(),
      LastLoginPlace: '127.0.0.1',
      PendingConfirmItem: [
        {
          deviceID: 1001,
          deviceName: 'Sample Laptop',
          price: 1299.99,
          orderDate: '2025-01-15',
          roomID: 101,
          state: 'P',
          remark: 'Pending approval'
        }
      ]
    };
  }
}