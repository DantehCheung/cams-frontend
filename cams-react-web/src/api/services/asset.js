import axios from "axios";
import axiosInstance, { setAuthToken, getRefreshToken } from "../axios";

const getToken=() => {
  const token = axiosInstance.defaults.headers.common[
    "Authorization"
  ]?.replace("Bearer ", "");
  return token || null;
}


const PostData = async (url, data, config = {}) => {
  try {
    let response = await axiosInstance.post(url, data, config);
    console.log("API response in 15:", response.data);
    // 檢查是否有 errorCode
    if (response.data.errorCode) {
      console.log(`ErrorCode detected: ${response.data.errorCode}`);

      // 處理特定的錯誤代碼，例如 E10 或 E04
      if (response.data.errorCode === "E10" || response.data.errorCode === "E04") {
        console.log("Token expired or invalid, attempting to renew...");

        // 嘗試刷新 Token
        const refreshResponse = await axiosInstance.post("renewtoken", {
          refreshToken: getRefreshToken(),
        });

        if (refreshResponse.data && !refreshResponse.data.errorCode) {
          // 更新新的 Token
          setAuthToken(refreshResponse.data.token, refreshResponse.data.refreshToken);
          data.token = refreshResponse.data.token;
          // 使用新的 Token 重試原始請求
          const retryResponse = await axiosInstance.post(url, data, config = {});
          if (retryResponse.data && !retryResponse.data.errorCode) {
            return retryResponse;
          } else {
            console.error("Retry request failed:", retryResponse.data);
            return retryResponse;
          }
        } else {
          console.error("Failed to renew token:", refreshResponse.data);
          return refreshResponse;
        }
      } else {
        // 處理其他 errorCode
        console.error(`Unhandled errorCode: ${response.data.errorCode}`);
        return response;
      }
    }

    // 如果沒有 errorCode，返回正常的響應
    return response;
  } catch (error) {
    console.error("fetchData error:", error);
    throw error;
  }
};


const GetData = async (url, config = {}) => {
  try {
    let response = await axiosInstance.get(url, config);
    
    // For JSON responses, keep your existing error code handling
    if (response.data && typeof response.data === 'object' && !response.data.type) {
      if (response.data.errorCode === "E10" || response.data.errorCode === "E04") {
        // Your existing token refresh logic
      }
    }
    
    return response;
  } catch (error) {
    console.error("fetchData error:", error);
    
    // Check if this might be a token expiration error (500 or 401)
    if ((error.response?.status === 500 || error.response?.status === 401) && 
        config.responseType === 'blob') {
      
      console.log("Possible token expiration for blob request, attempting refresh");
      
      try {
        // Try refreshing the token
        const refreshResponse = await axiosInstance.post("renewtoken", {
          refreshToken: getRefreshToken(),
        });
        
        if (refreshResponse.data && !refreshResponse.data.errorCode) {
          // Update the token
          setAuthToken(refreshResponse.data.token, refreshResponse.data.refreshToken);
          
          // Update the request config with the new token
          if (!config.headers) config.headers = {};
          config.headers.token = refreshResponse.data.token;
          
          // Retry the request with the new token
          console.log("Retrying download with new token");
          return await axiosInstance.get(url, config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }
    
    // If we couldn't handle the error, re-throw it
    throw error;
  }
};

/*const GetData = async (url, data, config = {}) => {
  try {
    let response = await axiosInstance.get(url, config);
    console.log("API response in 15:", response.data);
    // 檢查是否有 errorCode
    if (response.data.errorCode) {
      console.log(`ErrorCode detected: ${response.data.errorCode}`);

      // 處理特定的錯誤代碼，例如 E10 或 E04
      if (response.data.errorCode === "E10" || response.data.errorCode === "E04") {
        console.log("Token expired or invalid, attempting to renew...");

        // 嘗試刷新 Token
        const refreshResponse = await axiosInstance.post("renewtoken", {
          refreshToken: getRefreshToken(),
        });

        if (refreshResponse.data && !refreshResponse.data.errorCode) {
          // 更新新的 Token
          setAuthToken(refreshResponse.data.token, refreshResponse.data.refreshToken);
          data.headers.token = refreshResponse.data.token;
          // 使用新的 Token 重試原始請求
          const retryResponse = await axiosInstance.get(url,data ,config);
          if (retryResponse.data && !retryResponse.data.errorCode) {
            return retryResponse;
          } else {
            console.error("Retry request failed:", retryResponse.data);
            return retryResponse;
          }
        } else {
          console.error("Failed to renew token:", refreshResponse.data);
          return refreshResponse;
        }
      } else {
        // 處理其他 errorCode
        console.error(`Unhandled errorCode: ${response.data.errorCode}`);
        return response;
      }
    } 

    // 如果沒有 errorCode，返回正常的響應
    return response;
  } catch (error) {
    console.error("fetchData error:", error);
    throw error;
  }
};*/

export const getHomeData = async () => {
  try {
    // No need to get token from localStorage anymore - the axios interceptor will add it to headers
    // The backend should be updated to get the token from Authorization header instead of request body
    // For now, we'll get the token from the axios default headers if we need to include it in body
    const token = getToken();

    // Send token in the request body as JSON (for backward compatibility with current backend)
    const response = await PostData("gethome", {
      token: token,
    });



    if (response.data && !response.data.errorCode) {
      // No need to update localStorage anymore - all user info is managed by AuthContext

      // Return the full response data which includes PendingConfirmItem
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Get home data error:", error);
    // Return mock data instead of throwing error
    console.log("Using mock data for home since API endpoint is not available");
  }
};

// Campus Call API Request
export const getCampusData = async () => {
  try {
    const token = getToken();
    const response = await PostData("getcampus", {
      token: token,
    });

    // Log the response for debugging
    //console.log("API response from getCampusData:", response.data);

    if (response.data && !response.data.errorCode) {
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("Get campus data error:", error);
  }
};

export const addCampus = async (campusName, campusShortName) => {
  try {
    const token = getToken();
    const response = await PostData("addcampus", {
      campusName: campusName,
      campusShortName: campusShortName,
      token: token,
    });

    //console.log("API response from addCampus:", response.data);

    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Add campus error:", error);
    return { success: false, error: error.message };
  }
};

export const editCampus = async (campusId, campusName, campusShortName) => {
  try {
    const token = getToken();
    const response = await PostData("editcampus", {
      campusID: campusId,
      campusName: campusName,
      campusShortName: campusShortName,
      token: token,
    });

   // console.log("API response from editCampus:", response.data);

    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Edit campus error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteCampus = async (campusId) => {
  try {
    const token = getToken();
    const response = await PostData("deletecampus", {
      campusID: campusId,
      token: token,
    });

    //console.log("API response from deleteCampus:", response.data);

    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Delete campus error:", error);
    return { success: false, error: error.message };
  }
};

// Room Call API Request

export const getRoomsByCampus = async (campusId) => {
  try {
    const token = getToken();
    const response = await PostData("getrooms", {
      campusID: campusId,
      token: token,
    });

   // console.log("API response from getRoomsByCampus:", response.data);

    if (response.data && !response.data.errorCode) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Get rooms error:", error);
    return { success: false, error: error.message };
  }
};

export const addRoom = async (campusId, roomNumber, roomName) => {
  try {
    const token = getToken();
    const response = await PostData("addroom", {
      campusID: campusId,
      roomNumber: roomNumber,
      roomName: roomName,
      token: token,
    });

    //console.log("API response from addRoom:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Add room error:", error);
    return { success: false, error: error.message };
  }
};

export const editRoom = async (roomId, campusId, roomNumber, roomName) => {
  try {
    const token = getToken();
    const response = await PostData("editroom", {
      roomID: roomId,
      campusID: campusId,
      roomNumber: roomNumber,
      roomName: roomName,
      token: token,
    });

   // console.log("API response from editRoom:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Edit room error:", error);
    return { success: false, error: error.message };
  }
};

export const deleteRoom = async (roomId) => {
  try {
    const token = getToken();
    const response = await PostData("deleteroom", {
      roomID: roomId,
      token: token,
    });

   // console.log("API response from deleteRoom:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Delete room error:", error);
    return { success: false, error: error.message };
  }
};

// Item/Device Call API Request

export const getItemsByRoom = async (roomId, stateList = []) => {
  try {
    const token = getToken();
    // Prepare request data with optional stateList
    const requestData = {
      roomID: roomId,
      token: token,
    };

    // Only include stateList if it has values
    if (Array.isArray(stateList) && stateList.length > 0) {
      requestData.stateList = stateList;
    }

  //  console.log("Sending getitems request with data:", requestData);
    const response = await PostData("getitems", requestData);

   // console.log("API response from getItemsByRoom:", response.data);

    // Check if we have a valid response with device data
    if (response.data) {
      // Even if device array is empty, this is a valid response
      if (Array.isArray(response.data.device)) {
        // Format the devices properly for frontend use (if any exist)
        const formattedDevices = response.data.device.map((device) => {
          // Log the raw device object to better understand its structure
          console.log("Raw device from API:", device);

          return {
            deviceId: device.deviceID, // Normalize the property name
            name: device.deviceName,
            state: device.state,
            price: device.price,
            maintenanceDate: device.maintenanceDate,
            roomId: device.roomID,
            remark: device.remark,
            // Use the correct field names from the API response
            parts: device.partID || [], // API returns partID, not deviceParts
            rfids: device.deviceRFID || [], // Include RFID data
            orderDate: device.orderDate,
            arriveDate: device.arriveDate,
            docs: device.docs || [],
          };
        });

        return {
          success: true,
          data: formattedDevices,
          rawData: response.data, // Keep the raw data if needed
        };
      } else {
        // If for some reason device is not an array but the response is otherwise valid
        return { success: true, data: [], rawData: response.data };
      }
    }

    // If we reach here, there's some issue with the response format
    return { success: false, error: "Invalid response format" };
  } catch (error) {
    console.error("Get items error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new device
 */
export const addDevice = async (deviceData) => {
  try {
    const token = getToken();

   // console.log("Adding device with data:", deviceData);
   // console.log("Device parts from form:", deviceData.deviceParts);

    // Ensure deviceParts is an array
    if (!Array.isArray(deviceData.deviceParts)) {
      deviceData.deviceParts = [];
    }

    // Map the device parts to the expected format
    const formattedParts = deviceData.deviceParts.map((part) => {
      const formattedPart = {
        devicePartName: part.devicePartName,
        deviceRFID: [],
      };

      // Format RFIDs if they exist
      if (Array.isArray(part.deviceRFID) && part.deviceRFID.length > 0) {
        formattedPart.deviceRFID = part.deviceRFID.map((rfid) => {
          // If rfid is already an object with RFID property, use it
          if (typeof rfid === "object" && rfid.RFID) {
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
        remark: deviceData.remark,
      },
      deviceParts: formattedParts,
    };

   // console.log("Adding device with data:", payload);
    const response = await PostData("additem", payload);
   // console.log("Add device API response:", response.data);

    // Check if we have a deviceID in the response (new format)
    if (response.data && response.data.deviceID) {
      return {
        success: true,
        data: {
          status: true,
          deviceId: response.data.deviceID, // Map to consistent property name
        },
      };
    }

    // Backward compatibility with older API format
    if (response.data && response.data.status === true) {
      // Get the device ID from the response
      const deviceId = response.data.deviceId;
      if (!deviceId) {
        console.error(
          "Device created successfully but no ID found in response"
        );
        return {
          success: true,
          data: {
            status: true,
            deviceId: "pending",
          },
        };
      }
      return {
        success: true,
        data: {
          status: true,
          deviceId: deviceId,
        },
      };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Add device error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete whole device API -> All device parts, device docs, device RFIDs will be deleted
 */

export const deleteItemById = async (deleteTargetData) => {
  try {
    const response = await PostData("deleteitem", deleteTargetData);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.log("Delete item(whole) error : ", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing device
 */
export const updateDevice = async (deviceData) => {
  try {
    const token = getToken();
    // sensitive data
    // console.log('Updating device with data:', JSON.stringify(deviceData, null, 2));

    // Use the new edititem endpoint
    const response = await PostData("edititem", {
      ...deviceData,
      token: token,
    });

   // console.log("Edit device response:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Update device error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload a document file for a device
 */
export const uploadDeviceDoc = async (file, deviceId) => {
  try {
    
    if (!deviceId) {
      console.error("No device ID provided for file upload");
      return { success: false, error: "Device ID is required" };
    }

    /**
     *   // Ensure deviceId is properly converted to a number if it's a string
    const numericDeviceId =
    typeof deviceId === "string" ? parseInt(deviceId) : deviceId;
     */
  
    if (isNaN(deviceId)) {
      console.error("Invalid device ID for file upload:", deviceId);
      return { success: false, error: "Invalid device ID" };
    }

    const token = getToken();
    const numericDeviceId = parseInt(deviceId);
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deviceId", numericDeviceId); // Add deviceId to FormData

    // Set the proper headers for file upload
    const config = {
      headers: {
        "token": token,
        "Content-Type": "multipart/form-data", // ⚠️ Explicitly set Content-Type
      }
    };

    console.log(`Uploading file for device ID ${numericDeviceId}`);

    // Use the files endpoint for upload
    const response = await PostData(
      "files/devicedoc/upload",
      formData,
      config
    );
 //   console.log("File upload response:", response.data);

    if (
      response.data &&
      response.data.message === "File uploaded successfully"
    ) {
      return {
        success: true,
        data: {
          status: true,
          fileName: response.data.fileName,
          message: response.data.message,
        },
      };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Upload file error:", error);
    if (error.response?.status === 400) {
      return {
        success: false,
        error:
          "Invalid request: Please check that all required fields are provided correctly.",
      };
    }
    return { success: false, error: error.message };
  }
};

/**
 * Get document list for a device
 */
export const getDeviceDocuments = async (deviceId) => {
  try {
    const token = getToken();
    const response = await PostData(
      `files/devicedoc/list/${deviceId}`,
      {
        token: token,
      }
    );

    if (response.data && Array.isArray(response.data.files)) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Get device documents error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete RFID tag from device
 */
export const deleteRFID = async (rfidData) => {
  try {
    const response = await PostData("deleterfid", rfidData);

  //  console.log("API response from deleteRFID:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Delete RFID error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add/Assign new RFID tag to devicePart
 */
export const assignRFID = async (rfidData) => {
  try {
    const response = await PostData("assignrfid", rfidData);
 //   console.log("API response from addRFID:", response.data);
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Add RFID error:", error);
    return { success: false, error: error.message };
  }
};

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
    if (!path.includes("/")) {
      console.warn('Document path should be in format "deviceId/filename"');
    }

    // Extract the token from the Authorization header
    // The backend expects this as a separate 'token' header
    const token = getToken();

    // Make the request with the token in a specific header as required by the backend
    const response = await GetData(
      `files/devicedoc/download/${path}`,
      {
        responseType: "blob", // Important: Set responseType to 'blob' to receive binary data
        headers: {
          token: token, // Add the token as a specific header required by the backend
        },
      }
    );

    // Create a safe filename for download
    const filename = docPath.includes("/") ? docPath.split("/").pop() : docPath;

    // If we get here, the request was successful
    return {
      success: true,
      data: response.data,
      filename,
      contentType: response.headers["content-type"],
    };
  } catch (error) {
    console.error("Error downloading document:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

/**
 * Delete a document file for a device
 * @param {string} deviceId - The device ID
 * @param {string} docPath - The document path in format 'deviceId/filename'
 * @returns {Promise} - A promise that resolves with the API response
 */
export const deleteDeviceDoc = async (deviceId, docPath) => {
  try {
    // Extract the token from the Authorization header
    const token = getToken();

    // Make the request with the required parameters
    const response = await PostData("deletedoc", {
      token, // Include token in the request body as required by the API
      deviceID: deviceId, // The device ID
      docPath, // The full document path
    });

    return { success: true, status: response.data.status };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

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
    const token = getToken();

    // Prepare the request payload
    const payload = {
      token,
      deviceID: partData.deviceID,
      partID: partData.partID,
      partName: partData.partName,
      state: partData.state,
    };

    // Make the API request
    const response = await PostData("updateitempart", payload);

  //  console.log("Update item part response:", response.data);

    // Return response with success flag
    return {
      success: true,
      status: response.data.status,
    };
  } catch (error) {
    console.error("Error updating item part:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
      status: false,
    };
  }
};

export const borrowItem = async (borrowData) => {
  try {
    const token = getToken();

    // Create the request payload
    const requestData = {
      token: token,
      itemID: borrowData.itemID,
      endDate: borrowData.endDate,
    };

    // Make the API call
    const response = await PostData("br/borrow", requestData);

   // console.log("API response from borrowItem:", response.data);

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    }

    // Handle API error response
    let errorMessage = "Unknown API error";
    if (response.data) {
      if (typeof response.data === "string") {
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
  } catch (error) {
    console.error("Error borrowing item:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

export const getDeviceIdByRFID = async (rfid) => {
  try {
    // Extract the token from the Authorization header
    const token = getToken();

    const requestData = {
      token,
      RFID: rfid,
    };

    const response = await PostData("getitembyrfid", requestData);

   // console.log("API response from getDeviceIdByRFID:", response.data);

    // If there's a top-level deviceID, return it directly
    if (response.data /*&& typeof response.data.deviceID !== 'undefined'*/) {
      return { success: true, data: response.data };
    }

    // Handle API error response
    let errorMessage = "Unknown API error";
    if (response.data) {
      if (typeof response.data === "string") {
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
  } catch (error) {
    console.error("Get device ID by RFID error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

// Reserve an item using the reservation API
export const reserveItem = async (itemId, borrowRecordDate, endDate) => {
  try {
    // Get token from authorization header
    const token = getToken();

    // Prepare the request data
    const requestData = {
      token: token,
      itemID: itemId,
      borrowRecordDate: borrowRecordDate,
      endDate: endDate,
    };

   // console.log("Sending reservation request:", requestData);

    // Send the reservation request
    const response = await PostData("br/reservation", requestData);

  //  console.log("Reservation response:", response.data);

    // Check if the request was successful
    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      // Handle error response
      let errorMessage = "Sorry, this item already reserved by somebody";
      if (response.data && response.data.message) {
        errorMessage = response.data.message;
      }
      return { success: false, error: errorMessage, data: response.data };
    }
  } catch (error) {
    console.error("Reservation error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Fetch borrow records with various filters
export const getBorrowRecords = async (params) => {
  try {
    // Get token from authorization header
    const token = getToken();

    // Prepare the request data with optional filters
    const requestData = {
      token: token,
      targetCNA: params.targetCNA || "",
      borrowdDateAfter: params.borrowDateAfter || "",
      returned: params.returned || false,
    };

  //  console.log("Fetching borrow records with params:", requestData);

    // Send the API request
    const response = await PostData(
      "br/getborrowrecord",
      requestData
    );

  //  console.log("Borrow records response:", response.data);

    // Check if the request was successful and contains borrow records
    if (response.data && response.data.borrowRecord) {
      return {
        success: true,
        records: response.data.borrowRecord,
        totalRecords: response.data.borrowRecord.length,
        data: response.data,
      };
    } else {
      // Handle response with no records
      return {
        success: true,
        records: [],
        totalRecords: 0,
        data: response.data,
      };
    }
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    return {
      success: false,
      records: [],
      totalRecords: 0,
      error: error.message || "Failed to fetch borrow records",
    };
  }
};

// return///////////////////////////////////////////////////////////////////////////////////////////////
export const checkReturn = async (checkReturnParams) => {
  try {
    const token = getToken();
    const requestData = {
      token: token,
      RFIDList: checkReturnParams.rfidlist,
    };

    const response = await PostData("br/check", requestData);

    // Assuming the backend returns something like [{ deviceID, deviceName, partsChecked }]
    if (response.data) {
      // Shape the response so it has a "checkedDevice" property
      return {
        checkedDevice: response.data.checkedDevice,
      };
    }
  } catch (error) {
    console.error("Error checking return:", error);
  }
};
//------------------------------------------------------------------------------------------------------

export const returnItem = async (rfidListData) => {
  try {
    const token = getToken();

    const idList = [];
    console.log("RFID List Data:", rfidListData.rfidList);
    for (const rfidtag of rfidListData.rfidList) {
      const devicedata = await getDeviceIdByRFID(rfidtag);
      var deviceid = devicedata.data.deviceID;
      if (!idList.includes(deviceid)) {
        idList.push(deviceid);
      }
    }

    console.log("Device ID List:", idList);

    const response = await PostData("br/return", {
      token: token,
      returnList: idList,
    });



    console.log("Return item response:", response.data);

    // Now we expect the backend to return an object with returnStatus
    // e.g. { "returnStatus": [ { "itemID": 1, "state": true }, { "itemID": 2, "state": false } ] }
    if (response.data && Array.isArray(response.data.returnStatus)) {
      return {
        success: true,
        returnedItems: response.data.returnStatus, // array of { itemID, state }
      };
    }

    // Otherwise treat it as an error or unexpected format
    return { success: false, error: response.data };
  } catch (error) {
    console.error("Error returning item:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// --------------------------------------------------------------------------------------------------------------
// Add User By Excel File

export const addUser = async (AddUserData) => {
  try {
    const token = getToken();
    const response = await PostData("/adduser", {
      token: token,
      userList: AddUserData.userList,
    });

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Bind card with sid
export const bindUserCard = async (targetCNA, targetSID) => {
  try {
    const token = getToken();
    const response = await PostData("/addusercard", {
      CardID: targetSID,
      CNA: targetCNA,
      token: token,
    });

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Edit user card
export const editCard = async (editCardData) => {
  try {
    const token = getToken();

    //console.log(editCardData)

    const response = await PostData("editusercard", {
      CardID: editCardData.cardID,
      newCardID: editCardData.newCardID,
      state: editCardData.targetState,
      token: token,
    });

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Delete user card
export const deleteCard = async (deleteCardID) => {
  try {
    const token = getToken();

  //  console.log("delCardid:", deleteCardID);
    const response = await PostData("/deleteusercard", {
      CardID: deleteCardID,
      token: token,
    });

    // console.log(response)
    // console.log(response.data)

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const token = getToken();

    const response = await PostData("/changepw", {
      token: token,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
    });

    if (response.data && response.data.status === true) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// download app

// Add this function to asset.js
export const downloadElectronApp = async (platform, packageType, onProgress) => {
  try {
    if (!platform || !packageType) {
      throw new Error("Platform and package type are required for download");
    }
    // Determine the download URL based on platform and package type
    const url =
      platform === "android"
      ? `/files/app/download/android?auto=true`
      : `/files/app/download/${platform}/${packageType}?auto=true`;

    // Fetch the file as a blob
    const response = await GetData(url, {
      responseType: "blob", // Important for binary file downloads
      timeout: 120000,     // Increase timeout to 2 minutes (120,000ms)
      onDownloadProgress: (progressEvent) => {
        // Calculate progress percentage
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Download progress: ${percentCompleted}%`);
        
        // Call the progress callback if provided
        if (onProgress && typeof onProgress === 'function') {
          onProgress(percentCompleted);
        }
      }
    });

    // Create a blob URL for the downloaded file
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;

    // Set a meaningful filename based on platform and package type
    const filename =
      platform === "android"
      ? "CAMS_android.apk"
      : `CAMS_${platform}_${packageType}.zip`;
    link.setAttribute("download", filename);

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Use removeChild instead of remove for better compatibility

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);

    // Reset progress
    if (onProgress) onProgress(0);
    return { success: true };
  } catch (error) {
    console.error("Download error:", error);
    // Reset progress on error
    if (onProgress) onProgress(0);
    return { success: false, error: error.message };
  }
};
// Generate Report

// Borrow Report

export const generateBorrowReport = async (reportData) => {
  try {
    const token = getToken();

    const response = await PostData("/report/device-borrow-history", {
      token: token,
      studentCNA: reportData.targetCNA,
    });

    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};

// Overdue Report

export const generateOverdueReport = async (reportData) => {

  try{

    const token = getToken();

    const response = await PostData("/report/overdue-devices",{
      token: token,
      campusID: reportData.campusID,
      roomID: reportData.roomID,
      cutoffDate: reportData.cutoffDate,
    })

    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }


  }catch(error){
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }

}

// Device Status Report

export const generateDeviceStatusReport = async () => {

  try{
     
    const token = getToken();

    const response = await PostData("/report/device-status-report",{
      token: token
    })

    if (response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }

  }catch(error){

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };

  }
}