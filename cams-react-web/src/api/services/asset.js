import axiosInstance, { setAuthToken } from '../axios';


export const getHomeData = async () => {
  try {
    // No need to get token from localStorage anymore - the axios interceptor will add it to headers
    // The backend should be updated to get the token from Authorization header instead of request body
    // For now, we'll get the token from the axios default headers if we need to include it in body
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Send token in the request body as JSON (for backward compatibility with current backend)
    const response = await axiosInstance.post('gethome', {
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

  }
}

export const getCampusData = async () => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('getcampus', {
      token: token
    });
    
    // Log the response for debugging
    console.log('API response from getCampusData:', response.data);
    
    if (response.data && !response.data.errorCode) {
      return response.data;
    }
    return response.data;
  } catch(error) {
    console.error('Get campus data error:', error);
  }
}

export const addCampus = async (campusName, campusShortName) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('addcampus', {
      campusName: campusName,
      campusShortName: campusShortName,
      token: token
    });
    
    console.log('API response from addCampus:', response.data);
    
    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Add campus error:', error);
    return { success: false, error: error.message };
  }
}

export const editCampus = async (campusId, campusName, campusShortName) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('editcampus', {
      campusID: campusId,
      campusName: campusName,
      campusShortName: campusShortName,
      token: token
    });
    
    console.log('API response from editCampus:', response.data);
    
    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Edit campus error:', error);
    return { success: false, error: error.message };
  }
}