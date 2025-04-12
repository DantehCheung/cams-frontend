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

export const getItemsByRoom = async (roomId, stateList = []) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    // Prepare request data with optional stateList
    const requestData = {
      roomID: roomId,
      token: token
    };
    
    // Only include stateList if it has values
    if (Array.isArray(stateList) && stateList.length > 0) {
      requestData.stateList = stateList;
    }
    
    console.log('Sending getitems request with data:', requestData);
    const response = await axiosInstance.post('getitems', requestData);
    
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
    
    console.log('Adding device with data:', deviceData);
    console.log('Device parts from form:', deviceData.deviceParts);

    // Ensure deviceParts is an array
    if (!Array.isArray(deviceData.deviceParts)) {
      deviceData.deviceParts = [];
    }

    // Map the device parts to the expected format
    const formattedParts = deviceData.deviceParts.map(part => {
      const formattedPart = {
        devicePartName: part.devicePartName,
        deviceRFID: []
      };
      
      // Format RFIDs if they exist
      if (Array.isArray(part.deviceRFID) && part.deviceRFID.length > 0) {
        formattedPart.deviceRFID = part.deviceRFID.map(rfid => {
          // If rfid is already an object with RFID property, use it
          if (typeof rfid === 'object' && rfid.RFID) {
            return rfid;
          }
          // Otherwise convert string to expected format
          return { RFID: rfid };
        });
      }
      
      return formattedPart;
    });

    // Prepare the request payload using new format
    const payload = {
      token: token,
      device: {
        deviceName: deviceData.deviceName,
        price: parseFloat(deviceData.price),
        orderDate: deviceData.orderDate,
        arriveDate: deviceData.arriveDate,
        maintenanceDate: deviceData.maintenanceDate,
        roomID: parseInt(deviceData.roomID),
        state: deviceData.state,
        remark: deviceData.remark
      },
      deviceParts: formattedParts
    };

    console.log('Adding device with data:', payload);
    const response = await axiosInstance.post('additem', payload);
    console.log('Add device API response:', response.data);

    // Check if we have a deviceID in the response (new format)
    if (response.data && response.data.deviceID) {
      return {
        success: true,
        data: {
          status: true,
          deviceId: response.data.deviceID // Map to consistent property name
        }
      };
    }
    
    // Backward compatibility with older API format
    if (response.data && response.data.status === true) {
      // Get the device ID from the response
      const deviceId = response.data.deviceId;
      if (!deviceId) {
        console.error('Device created successfully but no ID found in response');
        return {
          success: true,
          data: {
            status: true,
            deviceId: 'pending'
          }
        };
      }
      return {
        success: true,
        data: {
          status: true,
          deviceId: deviceId
        }
      };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Add device error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete whole device API -> All device parts, device docs, device RFIDs will be deleted
 */

export const deleteItemById = async (deleteTargetData) => {

  try{

    const response = await axiosInstance.post('deleteitem', deleteTargetData);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };

  }catch(error){
    console.log("Delete item(whole) error : ", error);
    return { success: false, error: error.message };
  }

}




/**
 * Update an existing device
 */
export const updateDevice = async (deviceData) => {
  try {
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    // sensitive data
    // console.log('Updating device with data:', JSON.stringify(deviceData, null, 2));
    
    // Use the new edititem endpoint
    const response = await axiosInstance.post('edititem', {
      ...deviceData,
      token: token
    });
    
    console.log('Edit device response:', response.data);
    
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
    
    // Set the proper headers for file upload
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'token': token
      },
      params: {
        deviceId: numericDeviceId
      }
    };
    
    console.log(`Uploading file for device ID ${numericDeviceId}`);
    
    // Use the files endpoint for upload
    const response = await axiosInstance.post('files/devicedoc/upload', formData, config);
    console.log('File upload response:', response.data);
    
    if (response.data && response.data.message === 'File uploaded successfully') {
      return { 
        success: true, 
        data: {
          status: true,
          fileName: response.data.fileName,
          message: response.data.message
        }
      };
    }
    return { success: false, error: response.data };
    
  } catch (error) {
    console.error('Upload file error:', error);
    if (error.response?.status === 400) {
      return { 
        success: false, 
        error: 'Invalid request: Please check that all required fields are provided correctly.'
      };
    }
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

/**
 * Delete RFID tag from device
 */
export const deleteRFID = async (rfidData) => {
  try {
    const response = await axiosInstance.post('deleterfid', rfidData);
    
    console.log('API response from deleteRFID:', response.data);
    
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch(error) {
    console.error('Delete RFID error:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Add/Assign new RFID tag to devicePart
 */
export const assignRFID = async (rfidData) => {
  try{
    const response = await axiosInstance.post("assignrfid", rfidData);
    console.log('API response from addRFID:',response.data);
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  }catch(error) {
    console.error('Add RFID error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download a document file for a device
 * @param {string} docPath - The document path in format 'deviceId/filename'
 * @returns {Promise} - A promise that resolves with the blob data
 */
export const downloadDeviceDoc = async (docPath) => {
  try {
    // Parse the docPath to ensure it's in the correct format (deviceId/filename)
    // The URL should be /files/devicedoc/download/{deviceId}/{filename}
    
    // Ensure we're using the correct path format without URL encoding the slash
    let path = docPath;
    if (!path.includes('/')) {
      console.warn('Document path should be in format "deviceId/filename"');
    }
    
    // Extract the token from the Authorization header
    // The backend expects this as a separate 'token' header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Make the request with the token in a specific header as required by the backend
    const response = await axiosInstance.get(`files/devicedoc/download/${path}`, {
      responseType: 'blob', // Important: Set responseType to 'blob' to receive binary data
      headers: {
        'token': token // Add the token as a specific header required by the backend
      }
    });
    
    // Create a safe filename for download
    const filename = docPath.includes('/') ? docPath.split('/').pop() : docPath;
    
    // If we get here, the request was successful
    return { 
      success: true,
      data: response.data,
      filename,
      contentType: response.headers['content-type']
    };
  } catch(error) {
    console.error('Error downloading document:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Delete a document file for a device
 * @param {string} deviceId - The device ID
 * @param {string} docPath - The document path in format 'deviceId/filename'
 * @returns {Promise} - A promise that resolves with the API response
 */
export const deleteDeviceDoc = async (deviceId, docPath) => {
  try {
    // Extract the token from the Authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Make the request with the required parameters
    const response = await axiosInstance.post('deletedoc', {
      token, // Include token in the request body as required by the API
      deviceID: deviceId, // The device ID
      docPath // The full document path
    });
    
    return { success: true, status: response.data.status };
  } catch(error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Update an item part's name and status
 * @param {Object} partData - The part data to update
 * @param {string} partData.deviceID - The device ID
 * @param {string} partData.partID - The part ID
 * @param {string} partData.partName - The new part name
 * @param {string} partData.state - The part state (A for Available, D for Destroyed)
 * @returns {Promise} - A promise that resolves with the API response
 */
export const updateItemPart = async (partData) => {
  try {
    // Extract the token from the Authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Prepare the request payload
    const payload = {
      token,
      deviceID: partData.deviceID,
      partID: partData.partID,
      partName: partData.partName,
      state: partData.state
    };
    
    // Make the API request
    const response = await axiosInstance.post('updateitempart', payload);
    
    console.log('Update item part response:', response.data);
    
    // Return response with success flag
    return { 
      success: true, 
      status: response.data.status 
    };
  } catch(error) {
    console.error('Error updating item part:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error', 
      status: false 
    };
  }
}

export const borrowItem = async (borrowData) => {
    try{
        const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ','');
        
        // Create the request payload
        const requestData = {
            token: token,
            itemID: borrowData.itemID,
            endDate: borrowData.endDate
        };
        
        // Make the API call
        const response = await axiosInstance.post('br/borrow', requestData);
        
        console.log('API response from borrowItem:', response.data);
        
        if (response.data && response.data.status === true) {
            return { success: true, data: response.data };
        }
        
        // Handle API error response
        let errorMessage = 'Unknown API error';
        if (response.data) {
            if (typeof response.data === 'string') {
                errorMessage = response.data;
            } else if (response.data.errorMessage || response.data.message) {
                errorMessage = response.data.errorMessage || response.data.message;
            } else if (response.data.error) {
                errorMessage = response.data.error;
            } else {
                errorMessage = JSON.stringify(response.data);
            }
        }
        
        return { success: false, error: errorMessage };
    }catch(error){
      console.error('Error borrowing item:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
}

export const getDeviceIdByRFID = async (rfid) => {
  try{
     // Extract the token from the Authorization header
     const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');

     const requestData = {
       token,
       RFID: rfid
     }

     const response = await axiosInstance.post('getitembyrfid', requestData)

     console.log('API response from getDeviceIdByRFID:', response.data);

     // Check if the response has expected device data format
     if (response.data && 
         (response.data.deviceID !== undefined || 
          (response.data.data && response.data.data.deviceID !== undefined))) {
      
      // If the data is wrapped in a data property, return that
      if (response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      // Otherwise return the direct response data which has device info
      return { success: true, data: response.data };
    }
    
    // Handle API error response
    let errorMessage = 'Unknown API error';
    if (response.data) {
      if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else if (response.data.errorMessage || response.data.message) {
        errorMessage = response.data.errorMessage || response.data.message;
      } else if (response.data.error) {
        errorMessage = response.data.error;
      } else {
        errorMessage = JSON.stringify(response.data);
      }
    }
    
    return { success: false, error: errorMessage };
  }catch(error){
    console.error('Get device ID by RFID error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// Reserve an item using the reservation API
export const reserveItem = async (itemId, borrowRecordDate, endDate) => {
  try {
    // Get token from authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Prepare the request data
    const requestData = {
      token: token,
      itemID: itemId,
      borrowRecordDate: borrowRecordDate,
      endDate: endDate
    };
    
    console.log('Sending reservation request:', requestData);
    
    // Send the reservation request
    const response = await axiosInstance.post('br/reservation', requestData);
    
    console.log('Reservation response:', response.data);
    
    // Check if the request was successful
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      // Handle error response
      let errorMessage = 'Sorry, this item already reserved by somebody';
      if (response.data && response.data.message) {
        errorMessage = response.data.message;
      }
      return { success: false, error: errorMessage, data: response.data };
    }
  } catch (error) {
    console.error('Reservation error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

// Fetch borrow records with various filters
export const getBorrowRecords = async (params) => {
  try {
    // Get token from authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Prepare the request data with optional filters
    const requestData = {
      token: token,
      targetCNA: params.targetCNA || '',
      borrowdDateAfter: params.borrowDateAfter || '',
      returned: params.returned || false
    };
    
    console.log('Fetching borrow records with params:', requestData);
    
    // Send the API request
    const response = await axiosInstance.post('br/getborrowrecord', requestData);
    
    console.log('Borrow records response:', response.data);
    
    // Check if the request was successful and contains borrow records
    if (response.data && response.data.borrowRecord) {
      return { 
        success: true, 
        records: response.data.borrowRecord,
        totalRecords: response.data.borrowRecord.length,
        data: response.data 
      };
    } else {
      // Handle response with no records
      return { 
        success: true, 
        records: [], 
        totalRecords: 0,
        data: response.data 
      };
    }
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    return { 
      success: false, 
      records: [],
      totalRecords: 0,
      error: error.message || 'Failed to fetch borrow records' 
    };
  }
}
