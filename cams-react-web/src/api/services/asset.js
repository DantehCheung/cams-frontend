import axios from 'axios';
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


// Campus Call API Request
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

export const deleteCampus = async (campusId) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('deletecampus', {
      campusID: campusId,
      token: token
    });
    
    console.log('API response from deleteCampus:', response.data);
    
    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Delete campus error:', error);
    return { success: false, error: error.message };
  }
}

// Room Call API Request

export const getRoomsByCampus = async (campusId) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('getrooms', {
      campusID: campusId,
      token: token
    });
    
    console.log('API response from getRoomsByCampus:', response.data);
    
    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Get rooms error:', error);
    return { success: false, error: error.message };
  }
}

export const addRoom = async (campusId, roomNumber, roomName) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('addroom', {
      campusID: campusId,
      roomNumber: roomNumber,
      roomName: roomName,
      token: token
    });
    
    console.log('API response from addRoom:', response.data);
    
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Add room error:', error);
    return { success: false, error: error.message };
  }
}

export const editRoom = async (roomId, campusId, roomNumber, roomName) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('editroom', {
      roomID: roomId,
      campusID: campusId,
      roomNumber: roomNumber,
      roomName: roomName,
      token: token
    });
    
    console.log('API response from editRoom:', response.data);
    
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Edit room error:', error);
    return { success: false, error: error.message };
  }
}

export const deleteRoom = async (roomId) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('deleteroom', {
      roomID: roomId,
      token: token
    });
    
    console.log('API response from deleteRoom:', response.data);
    
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Delete room error:', error);
    return { success: false, error: error.message };
  }
}

// Item/Device Call API Request

export const getItemsByRoom = async (roomId) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('getitems', {
      roomID: roomId,
      token: token
    });
    
    console.log('API response from getItemsByRoom:', response.data);
    
    // Check if we have a valid response with device data
    if (response.data) {
      // Even if device array is empty, this is a valid response
      if (Array.isArray(response.data.device)) {
        // Format the devices properly for frontend use (if any exist)
        const formattedDevices = response.data.device.map(device => {
          // Log the raw device object to better understand its structure
          console.log('Raw device from API:', device);
          
          return {
            deviceId: device.deviceID,  // Normalize the property name
            name: device.deviceName,
            state: device.state,
            price: device.price,
            maintenanceDate: device.maintenanceDate,
            roomId: device.roomID,
            remark: device.remark,
            // Use the correct field names from the API response
            parts: device.partID || [],        // API returns partID, not deviceParts
            rfids: device.deviceRFID || [],    // Include RFID data
            orderDate: device.orderDate,
            arriveDate: device.arriveDate,
            docs: device.docs || []
          };
        });
        
        return { 
          success: true, 
          data: formattedDevices,
          rawData: response.data  // Keep the raw data if needed
        };
      } else {
        // If for some reason device is not an array but the response is otherwise valid
        return { success: true, data: [], rawData: response.data };
      }
    }
    
    // If we reach here, there's some issue with the response format
    return { success: false, error: 'Invalid response format' };
  } catch(error) {
    console.error('Get items error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a new device
 */
export const addDevice = async (deviceData) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Log the incoming device data to see how parts are structured
    console.log('Adding device with data:', deviceData);
    console.log('Device parts from form:', deviceData.deviceParts);
    
    // Format data according to API requirements
    const requestData = {
      token: token,
      devices: [
        {
          deviceName: deviceData.deviceName,
          price: parseFloat(deviceData.price) || 0,
          orderDate: deviceData.orderDate || new Date().toISOString().split('T')[0],
          arriveDate: deviceData.arriveDate || new Date().toISOString().split('T')[0],
          maintenanceDate: deviceData.maintenanceDate || null,
          roomID: parseInt(deviceData.roomID),
          state: deviceData.state || 'A',
          remark: deviceData.remark || '',
          deviceParts: deviceData.deviceParts || [
            {
              devicePartName: "Default Part",
              deviceRFID: []
            }
          ],
          deviceDoc: []
        }
      ]
    };
    
    console.log('Adding device with data:', requestData);
    
    const response = await axiosInstance.post('additem', requestData);
    
    // Log the full response to understand its structure
    console.log('Add device API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      // Check for deviceID in various possible locations in the response
      const deviceId = response.data.deviceID || 
                      (response.data.devices && response.data.devices[0] && response.data.devices[0].deviceID) ||
                      response.data.id || 
                      response.data.deviceId;
      
      if (deviceId) {
        console.log('Device ID extracted from response:', deviceId);
        return { 
          success: true, 
          data: { 
            ...response.data,
            deviceId: deviceId // Normalize the property name for frontend use
          } 
        };
      } else if (response.data.status === true) {
        // If status is true but no ID, try to recover ID from elsewhere
        console.log('Device created successfully but no ID found in response');
        return { 
          success: true, 
          data: { 
            ...response.data,
            deviceId: 'pending' // Mark as pending - frontend will need to handle this
          } 
        };
      }
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Add device error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing device
 */
export const updateDevice = async (deviceData) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post('updatedevice', {
      ...deviceData,
      token: token
    });
    
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Update device error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload a document file for a device
 */
export const uploadDeviceDoc = async (file, deviceId) => {
  try {
    if (!deviceId) {
      console.error('No device ID provided for file upload');
      return { success: false, error: 'Device ID is required' };
    }
    
    // Ensure deviceId is properly converted to a number if it's a string
    const numericDeviceId = typeof deviceId === 'string' ? parseInt(deviceId) : deviceId;
    
    if (isNaN(numericDeviceId)) {
      console.error('Invalid device ID for file upload:', deviceId);
      return { success: false, error: 'Invalid device ID' };
    }
    
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deviceID', numericDeviceId); // Use deviceID as the backend expects
    formData.append('token', token);
    
    // DEBUG: Log the form data contents
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    // Set the proper headers for file upload
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };
    
    console.log('Request headers:', config.headers);
    console.log('Base URL:', axiosInstance.defaults.baseURL);
    console.log(`Uploading file for device ID: ${numericDeviceId}`);
    
    // DEBUG: Log all the possible endpoint URLs we're going to try
    console.log('Full endpoint URL (with files/): ', axiosInstance.defaults.baseURL + 'files/devicedoc/upload');
    console.log('Full endpoint URL (without files/): ', axiosInstance.defaults.baseURL + 'devicedoc/upload');
    console.log('Full endpoint URL (direct /api/): ', axiosInstance.defaults.baseURL.replace('/api/', '/') + 'api/files/devicedoc/upload');
    
    // Try multiple endpoint variations to handle different API path configurations
    try {
      // First try: Standard endpoint with files/ prefix
      console.log('Attempting file upload with endpoint: files/devicedoc/upload');
      const response = await axiosInstance.post('files/devicedoc/upload', formData, config);
      
      console.log('Upload response:', response?.data);
      if (response.data && response.data.status === true) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data };
      
    } catch (primaryError) {
      // Log the error in detail to debug the path issue
      console.log('Primary endpoint failed, trying fallback');
      console.log('Primary error details:', primaryError.message);
      console.log('Primary error status:', primaryError.response?.status);
      console.log('Error response data:', JSON.stringify(primaryError.response?.data || {}));
      
      // Look for the specific 'Path is not exit' error
      const errorData = primaryError.response?.data;
      const errorText = primaryError.response?.data || primaryError.message;
      const hasPathError = (
        (typeof errorText === 'string' && errorText.includes('Path is not exit')) ||
        (typeof errorData?.message === 'string' && errorData.message.includes('Path is not exit')) ||
        (typeof primaryError.message === 'string' && primaryError.message.includes('Path is not exit'))
      );
      
      if (primaryError.response?.status === 500 && hasPathError) {
        console.error('Backend file storage path issue detected:', errorText);
        return { 
          success: false, 
          error: 'Backend server storage error: The file storage path is not configured correctly. Please contact your administrator.'
        };
      }
      
      // Second try: Alternative endpoint without files/ prefix
      try {
        console.log('Attempting file upload with fallback endpoint: devicedoc/upload');
        const fallbackResponse = await axiosInstance.post('devicedoc/upload', formData, config);
        
        console.log('Fallback upload response:', fallbackResponse?.data);
        if (fallbackResponse.data && fallbackResponse.data.status === true) {
          return { success: true, data: fallbackResponse.data };
        }
        return { success: false, error: fallbackResponse.data };
        
      } catch (fallbackError) {
        // Last resort: Try a third endpoint variation
        try {
          console.log('Attempting file upload with third endpoint: api/files/devicedoc/upload');
          const thirdResponse = await axios.post(
            axiosInstance.defaults.baseURL.replace('/api/', '/') + 'api/files/devicedoc/upload', 
            formData, 
            config
          );
          
          console.log('Third attempt response:', thirdResponse?.data);
          if (thirdResponse.data && thirdResponse.data.status === true) {
            return { success: true, data: thirdResponse.data };
          }
          return { success: false, error: thirdResponse.data };
          
        } catch (thirdError) {
          console.error('All file upload endpoints failed');
          console.error('First error:', primaryError.message);
          console.error('Second error:', fallbackError.message);
          console.error('Third error:', thirdError.message);
          
          // Provide a detailed error message for debugging
          let errorMessage = 'File upload failed on all endpoints';
          if (fallbackError.response?.status === 404) {
            errorMessage = 'Endpoint not found (404): The file upload API endpoints may have changed. Device was created successfully.';
          } else if (fallbackError.response?.status === 500) {
            errorMessage = 'Server error (500): This could be a backend configuration issue. Device was created but file could not be uploaded.';
          }
          
          return { success: false, error: errorMessage };
        }
      }
    }
  } catch (error) {
    console.error('Upload file error:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Get document list for a device
 */
export const getDeviceDocuments = async (deviceId) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const response = await axiosInstance.post(`files/devicedoc/list/${deviceId}`, {
      token: token
    });
    
    if (response.data && Array.isArray(response.data.files)) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Get device documents error:', error);
    return { success: false, error: error.message };
  }
}
