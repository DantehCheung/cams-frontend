import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, Upload, message, Select, Spin, Tag, DatePicker, Divider, Popconfirm } from "antd";
import { InboxOutlined, PlusOutlined, DeleteOutlined, FilePdfOutlined, FileImageOutlined, FileUnknownOutlined, DownloadOutlined } from "@ant-design/icons";
import { assetService } from "../../api";
import axiosInstance from "../../api/axios";

const { Title } = Typography;


const ManageItem = () => {
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [deviceParts, setDeviceParts] = useState([{ id: Date.now(), name: '' }]);
  const [manualDeviceIdModalVisible, setManualDeviceIdModalVisible] = useState(false);
  const [manualDeviceId, setManualDeviceId] = useState('');
  const [pendingUploads, setPendingUploads] = useState(null);
  const [deviceCreated, setDeviceCreated] = useState(false);
  const [createdDeviceId, setCreatedDeviceId] = useState(null);
  const [fileUploadEnabled, setFileUploadEnabled] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  // State to track which row is currently expanded (null means no rows expanded)
  const [expandedRowKey, setExpandedRowKey] = useState(null);
  // State for RFID assignment modal
  const [rfidModalVisible, setRfidModalVisible] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [rfidValue, setRfidValue] = useState('');

  const showAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setDeviceCreated(false);
    setCreatedDeviceId(null);
    setFileUploadEnabled(false);
    setFileList([]);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        setItems(items.filter((item) => item.key !== key));
        message.success("Item deleted successfully.");
      },
    });
  };
  
  // Function to handle document download
  const handleDownloadDocument = async (deviceId, docPath) => {
    try {
      setLoading(true);
      
      // Get the blob data directly from the asset service
      const result = await assetService.downloadDeviceDoc(docPath);
      
      if (result.success && result.data) {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(result.data);
        
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Use the filename from the result
        a.download = result.filename || 'document';
        
        // Add to body, click and remove
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        message.success('Document downloaded successfully');
      } else {
        message.error(`Failed to download document: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      message.error(`Error downloading document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle document deletion
  const handleDeleteDocument = async (deviceId, docPath) => {
    try {
      setLoading(true);
      
      // Call the delete document API
      const result = await assetService.deleteDeviceDoc(deviceId, docPath);
      
      if (result.success && result.status) {
        message.success('Document deleted successfully');
        
        // Refresh all items to show the updated document list
        if (selectedRoom) {
          // Directly call getItemsByRoom to refresh the data
          const response = await assetService.getItemsByRoom(selectedRoom);
          
          if (response.success) {
            // Process the response based on the data structure
            let deviceData = [];
            
            if (Array.isArray(response.devices)) {
              deviceData = response.devices;
            } else if (response.data && Array.isArray(response.data)) {
              deviceData = response.data;
            } else if (response.data && response.data.device && Array.isArray(response.data.device)) {
              deviceData = response.data.device;
            }
            
            // Update the items with the refreshed data
            setItems(deviceData);
            
            // If a row was expanded, maintain its expanded state
            if (expandedRowKey) {
              // Small delay to ensure the row is still available after refresh
              setTimeout(() => {
                setExpandedRowKey(expandedRowKey);
              }, 100);
            }
          }
        }
      } else {
        message.error(`Failed to delete document: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error(`Error deleting document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle RFID tag deletion
  const handleDeleteRFID = async (rfid, deviceId, partId) => {
    try {
      setLoading(true);
      // Get token from authorization header
      const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
      
      // Prepare the request data as specified
      const requestData = {
        token: token,
        RFID: rfid,
        deviceID: deviceId,
        partID: partId
      };
      
      console.log('Sending delete RFID request:', requestData);
      
      const response = await assetService.deleteRFID(requestData);
      
      if (response.success) {
        message.success('RFID tag deleted successfully');
        
        // Update the local state to remove the deleted RFID
        const updatedItems = items.map(item => {
          // Only update the item that contains the deleted RFID
          if (item.deviceId.toString() === deviceId.toString()) {
            // Filter out the deleted RFID
            const updatedRfids = (item.rfids || []).filter(r => r.rfid !== rfid);
            return { ...item, rfids: updatedRfids };
          }
          return item;
        });
        
        setItems(updatedItems);
      } else {
        message.error(`Failed to delete RFID tag: ${response.error?.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting RFID tag:', error);
      message.error(`Error deleting RFID tag: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to show the RFID assignment modal
  const showRfidAssignModal = (deviceId, partId) => {
    setSelectedDeviceId(deviceId);
    setSelectedPartId(partId);
    setRfidValue(''); // Clear any previous RFID value
    setRfidModalVisible(true);
  };
  
  // Function to handle RFID modal cancel
  const handleRfidModalCancel = () => {
    setRfidModalVisible(false);
    setSelectedDeviceId(null);
    setSelectedPartId(null);
    setRfidValue('');
  };
  
  // Function to handle RFID assignment
  const handleRfidAssign = () => {
    // In the future, this will contain the logic to assign the RFID to the part
    // For now, just close the modal and show a message
    message.success(`RFID assignment functionality will be implemented later`);
    setRfidModalVisible(false);
    setSelectedDeviceId(null);
    setSelectedPartId(null);
    setRfidValue('');
  };

  // Handle confirmation of device creation before proceeding to file upload
  const handleConfirmDevice = async () => {
    if (!createdDeviceId) {
      message.error('No device ID available');
      return;
    }
    
    setFileUploadEnabled(true);
    message.success('You can now upload files for this device. Add as many files as needed, then click "Finish & Upload Files".');
  };

  const handleOk = async () => {
    try {
      // If device has been created and we're in file upload mode, handle file submissions
      if (deviceCreated && fileUploadEnabled) {
        if (fileList.length > 0) {
          setUploadInProgress(true);
          await uploadFilesForDevice(createdDeviceId, fileList);
          setUploadInProgress(false);
        }
        
        // Show success message
        message.success('Device creation and file uploads completed successfully');
        
        // Close the modal and reset states
        setIsModalVisible(false);
        setDeviceCreated(false);
        setCreatedDeviceId(null);
        setFileUploadEnabled(false);
        setFileList([]);
        form.resetFields();
        return;
      }
      
      // Otherwise, this is the initial device creation step
      const values = await form.validateFields();
      setLoading(true);
      
      // Collect device parts data
      const formattedParts = deviceParts
        .filter(part => part.name.trim()) // Only include parts with names
        .map(part => ({
          devicePartName: part.name.trim(),
          deviceRFID: []
        }));
      
      // Format dates
      const orderDate = values.orderDate ? values.orderDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0];
      const arriveDate = values.arriveDate ? values.arriveDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0];
      const maintenanceDate = values.maintenanceDate ? values.maintenanceDate.format('YYYY-MM-DD') : null;
      
      if (editingItem) {
        // Handle update device
        const deviceData = {
          deviceName: values.name,
          roomID: parseInt(values.roomId, 10), // Ensure roomID is a number
          price: parseFloat(values.price) || 0, // Ensure price is a number
          orderDate: orderDate,
          arriveDate: arriveDate,
          maintenanceDate: maintenanceDate,
          state: values.state || 'A',
          remark: values.remark || '',
          deviceID: parseInt(editingItem.deviceId, 10) // Ensure deviceID is a number
        };
        
        console.log('Editing device with ID:', deviceData.deviceID);
        
        const response = await assetService.updateDevice(deviceData);
        
        if (response.success) {
          // If there are files to upload, upload them
          if (fileList.length > 0) {
            message.info('Uploading documents...');
            
            // Use the known device ID from the editing item
            const deviceId = editingItem.deviceId;
            console.log(`Uploading documents for device ID: ${deviceId}`);
            
            const uploadPromises = fileList
              .filter(file => file.originFileObj) // Only include newly added files
              .map(file => {
                console.log(`Preparing to upload file ${file.name} for device ID: ${deviceId}`);
                return assetService.uploadDeviceDoc(file.originFileObj, deviceId)
                  .then(result => {
                    console.log(`Upload result for ${file.name}:`, result);
                    if (result.success) {
                      message.success(`File ${file.name} uploaded successfully`);
                    } else {
                      message.error(`Failed to upload file ${file.name}: ${result.error || 'Unknown error'}`);
                    }
                    return result;
                  });
              });
            
            try {
              await Promise.all(uploadPromises);
            } catch (uploadError) {
              console.error('Error uploading files:', uploadError);
              message.error('Some files could not be uploaded');
            }
          }
          
          // Update item in local state
          const updatedItems = items.map(item => 
            item.key === editingItem.key ? {
              ...item,
              name: values.name,
              state: values.state,
              price: values.price,
              remark: values.remark,
              roomId: values.roomId,
              maintenanceDate: maintenanceDate
            } : item
          );
          setItems(updatedItems);
          
          message.success('Device updated successfully');
          setIsModalVisible(false);
          setFileList([]);
          setDeviceParts([{ id: Date.now(), name: '' }]);
          form.resetFields();
        } else {
          message.error(`Failed to update device: ${response.error?.description || 'Unknown error'}`);
        }
      } else {
        // Handle add device - prepare data for API call
        const deviceData = {
          deviceName: values.name,
          roomID: values.roomId,
          price: values.price || 0,
          orderDate: orderDate,
          arriveDate: arriveDate,
          maintenanceDate: maintenanceDate,
          state: values.state || 'A',
          remark: values.remark || '',
          deviceParts: formattedParts.length > 0 ? formattedParts : undefined
        };
        
        console.log('Adding device with data:', deviceData);
        
        // Log the data being sent to ensure it's correctly formatted
        console.log('Sending device data to API:', JSON.stringify(deviceData, null, 2));
        
        const response = await assetService.addDevice(deviceData);
        console.log('Add device response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // Check if deviceId exists in the response
          let deviceId = response.data.deviceId;
          
          // Save the created device ID and set device created state
          if (deviceId && deviceId !== 'pending') {
            setDeviceCreated(true);
            setCreatedDeviceId(deviceId);
            message.success(`Device created successfully with ID: ${deviceId}. Click 'Confirm' to proceed to file upload.`);
          } else {
            
            // Try to fetch the latest device for this room as a fallback
            try {
              const latestDevicesResponse = await assetService.getItemsByRoom(values.roomId);
              console.log('Latest devices:', latestDevicesResponse);
              
              // With our updated getItemsByRoom function, the data should now be an array of formatted devices
              if (latestDevicesResponse.success && Array.isArray(latestDevicesResponse.data)) {
                // Add additional logging to understand the data structure
                console.log('Device list:', JSON.stringify(latestDevicesResponse.data, null, 2));
                
                // Check if we have any devices that match our just-created device properties
                const matchingDevices = latestDevicesResponse.data.filter(device => 
                  device.name === values.name && 
                  device.state === (values.state || 'A') &&
                  device.remark === (values.remark || '')
                );
                
                if (matchingDevices.length > 0) {
                  // Sort by ID to get the highest/newest one first
                  matchingDevices.sort((a, b) => (parseInt(b.deviceId) || 0) - (parseInt(a.deviceId) || 0));
                  deviceId = matchingDevices[0].deviceId;
                  console.log('Found matching device ID:', deviceId);
                  message.success('Found device ID through matching properties. Will attempt file uploads.');
                } else {
                  // If no matching device, take the device with the highest ID (most recently added)
                  const sortedDevices = [...latestDevicesResponse.data].sort((a, b) => {
                    return (parseInt(b.deviceId) || 0) - (parseInt(a.deviceId) || 0);
                  });
                  
                  if (sortedDevices.length > 0 && sortedDevices[0].deviceId) {
                    deviceId = sortedDevices[0].deviceId;
                    console.log('Recovered device ID from latest devices:', deviceId);
                    message.success('Found device ID by taking most recent device. Will attempt file uploads.');
                  }
                }
              } else if (latestDevicesResponse.success && latestDevicesResponse.rawData && latestDevicesResponse.rawData.device) {
                // Fallback to raw API response if our formatted data doesn't work
                const deviceList = latestDevicesResponse.rawData.device;
                console.log('Raw device list:', deviceList);
                
                if (Array.isArray(deviceList) && deviceList.length > 0) {
                  // Sort devices by ID (descending)
                  const sortedDevices = [...deviceList].sort((a, b) => {
                    return (parseInt(b.deviceID) || 0) - (parseInt(a.deviceID) || 0);
                  });
                  
                  if (sortedDevices.length > 0) {
                    // Use deviceID from the API response (camel case differs from our normalized deviceId)
                    deviceId = sortedDevices[0].deviceID;
                    console.log('Recovered device ID from raw API response:', deviceId);
                    message.success('Found device ID through API raw data. Will attempt file uploads.');
                  }
                }
              }
            } catch (fallbackError) {
              console.error('Failed to get latest devices as fallback:', fallbackError);
            }
          }
          
          // If the current selected room matches the added device's room, update the UI
          if (selectedRoom === values.roomId && deviceId) {
            const newItem = {
              key: String(deviceId),
              deviceId: deviceId,
              name: values.name,
              state: values.state || 'A',
              price: values.price || 0,
              maintenanceDate: maintenanceDate,
              roomId: values.roomId,
              remark: values.remark || '',
              parts: formattedParts,
              rfids: []
            };
            setItems([...items, newItem]);
          }
        } else {
          message.error(`Failed to add device: ${response.error?.description || 'Unknown error'}`);
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        console.error('Error in form submission:', error);
        message.error(`Operation failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
    setDeviceParts([{ id: Date.now(), name: '' }]);
    setDeviceCreated(false);
    setCreatedDeviceId(null);
    setFileUploadEnabled(false);
  };
  
  // Function to upload the current batch without finishing the process
  const uploadCurrentBatch = async () => {
    if (fileList.length === 0) {
      message.info('No files selected for upload');
      return;
    }
    
    setUploadInProgress(true);
    await uploadFilesForDevice(createdDeviceId, fileList, true); // Clear files after upload
    setUploadInProgress(false);
  };
  
  // Helper function to upload files for a specific device ID
  const uploadFilesForDevice = async (deviceId, files, clearAfterUpload = false) => {
    try {
      if (files.length === 0) {
        message.info('No files selected for upload');
        return true;
      }
      
      message.info(`Uploading ${files.length} document(s) for device ID: ${deviceId}...`);
      console.log(`Attempting to upload ${files.length} files for device ID: ${deviceId}`);
      
      // Process files one by one sequentially for better control and feedback
      let successCount = 0;
      for (const file of files) {
        if (!file.originFileObj) {
          console.warn('File missing originFileObj:', file);
          continue;
        }
        
        console.log(`Uploading file ${file.name} for device ID: ${deviceId}`);
        try {
          const result = await assetService.uploadDeviceDoc(file.originFileObj, deviceId);
          console.log(`Upload result for ${file.name}:`, result);
          
          if (result.success) {
            message.success(`File ${file.name} uploaded successfully`);
            successCount++;
          } else {
            // Check for specific backend path error
            if (result.error && typeof result.error === 'string' && result.error.includes('Path is not exit')) {
              message.error(`Backend storage error: The server directory for storing files doesn't exist. Please contact the administrator.`);
            } else if (result.error && typeof result.error === 'string' && result.error.includes('Backend server storage error')) {
              message.error(result.error);
            } else {
              message.error(`Failed to upload file ${file.name}: ${result.error || 'Unknown error'}`);
            }
          }
        } catch (singleUploadError) {
          console.error(`Error uploading file ${file.name}:`, singleUploadError);
          message.error(`Failed to upload ${file.name}: ${singleUploadError.message}`);
        }
      }
      
      if (successCount > 0) {
        message.success(`Successfully uploaded ${successCount} of ${files.length} file(s)`);
      }
      
      // Clear the file list if requested
      if (clearAfterUpload) {
        setFileList([]);
      }
      
      return true;
    } catch (uploadError) {
      console.error('Error in file upload process:', uploadError);
      message.error('There was an error during the file upload process');
      return false;
    }
  };
    
  const handleManualDeviceIdSubmit = async () => {
    if (!manualDeviceId || manualDeviceId.trim() === '') {
      message.error('Please enter a valid device ID');
      return;
    }
    
    const deviceId = parseInt(manualDeviceId.trim());
    if (isNaN(deviceId)) {
      message.error('Device ID must be a number');
      return;
    }
    
    // Upload files with the manually entered device ID
    if (pendingUploads && pendingUploads.length > 0) {
      const result = await uploadFilesForDevice(deviceId, pendingUploads);
      if (result) {
        message.success('Files uploaded successfully with manual device ID');
        setPendingUploads(null);
      }
    }
    
    setManualDeviceIdModalVisible(false);
    setManualDeviceId('');
  };
  
  // Close the manual device ID modal
  const handleManualDeviceIdCancel = () => {
    setManualDeviceIdModalVisible(false);
    setManualDeviceId('');
    setPendingUploads(null);
    message.info('File upload canceled');
  };
  
  // Handle file upload changes
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };
  
  // Add a new empty part field
  const addDevicePart = () => {
    setDeviceParts([...deviceParts, { id: Date.now(), name: '' }]);
  };
  
  // Update part name
  const updatePartName = (id, newName) => {
    setDeviceParts(deviceParts.map(part => 
      part.id === id ? { ...part, name: newName } : part
    ));
  };
  
  // Remove a part
  const removePart = (id) => {
    // Don't remove if it's the last part
    if (deviceParts.length <= 1) {
      return;
    }
    setDeviceParts(deviceParts.filter(part => part.id !== id));
  };
  
  // Render a file icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileUnknownOutlined />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <FilePdfOutlined />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return <FileImageOutlined />;
    } else {
      return <FileUnknownOutlined />;
    }
  };

  // Fetch campus data when component mounts
  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        setLoading(true);
        const response = await assetService.getCampusData();
        
        console.log('Campus data response:', response);
        
        if (response && Array.isArray(response.c)) {
          const formattedCampuses = response.c.map(campus => ({
            key: campus.campusId.toString(),
            fullName: campus.campusName,
            shortName: campus.campusShortName
          }));
          setCampuses(formattedCampuses);
        } else {
          console.warn('Unexpected API response format:', response);
          setCampuses([]);
        }
      } catch (error) {
        console.error('Failed to fetch campus data:', error);
        message.error('Failed to load campus data');
        setCampuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampusData();
  }, []);

  // Handle campus change - fetch rooms for selected campus
  const handleCampusChange = (value) => {
    setSelectedCampus(value);
    setSelectedRoom(null); // Reset room selection when campus changes
    setItems([]); // Clear items when campus changes
    
    if (value) {
      fetchRoomsByCampus(value);
    } else {
      setRooms([]);
    }
  };

  // Fetch rooms by campus ID
  const fetchRoomsByCampus = async (campusId) => {
    try {
      setLoading(true);
      const response = await assetService.getRoomsByCampus(campusId);
      
      if (response.success && response.data.rooms) {
        const formattedRooms = response.data.rooms.map(room => ({
          key: room.room.toString(),
          roomId: room.room,
          campusId: room.campusId,
          roomNumber: room.roomNumber,
          name: room.roomName || room.roomNumber
        }));
        setRooms(formattedRooms);
      } else {
        message.error(`Failed to load rooms: ${response.error?.description || 'Unknown error'}`);
        setRooms([]);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      message.error(`Failed to load rooms: ${error.message}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle room change
  const handleRoomChange = (value) => {
    setSelectedRoom(value);
    setItems([]); // Clear items when room changes
  };

  // Fetch devices by room ID
  const handleSort = async () => {
    if (!selectedRoom) {
      message.warning('Please select a room first');
      return;
    }
    
    try {
      setLoading(true);
      const response = await assetService.getItemsByRoom(selectedRoom);
            console.log('getItemsByRoom response:', response);
        // Log the raw unprocessed response data to see original structure
        console.log('Raw API response data:', response.data);
        if (response.data && Array.isArray(response.data.device)) {
          console.log('Original device array:', response.data.device);
        }
      
      if (response.success) {
        // Check various possible data formats from the API
        let deviceData = [];
        
        if (Array.isArray(response.data)) {
          // If the service already formatted the data for us
          deviceData = response.data;
        } else if (response.rawData && Array.isArray(response.rawData.device)) {
          // If we have the raw device array from the API
          deviceData = response.rawData.device.map(device => {
            // Log the original device object to see all properties
            console.log('Original device data from API:', device);
            
            // Access the parts (partID) and rfids (deviceRFID) directly from the response
            // WITHOUT transforming them to preserve the exact structure
            const parts = device.partID || [];
            const rfids = device.deviceRFID || [];
            
            // Log parts data to debug
            console.log(`Device ${device.deviceID} parts:`, parts);
            console.log(`Device ${device.deviceID} RFIDs:`, rfids);
            
            return {
              key: device.id.toString(),
              deviceId: device.id,
              name: device.deviceName,
              price: device.price,
              orderDate: device.orderDate,
              arriveDate: device.arriveDate,
              maintenanceDate: device.maintenanceDate,
              roomId: device.roomID,
              state: device.state,
              remark: device.remark,
              docs: device.docs || [],
              parts: parts,
              rfids: rfids
            };
          });
        } else if (response.data && Array.isArray(response.data.device)) {
          // Legacy format - if data contains a device array
          deviceData = response.data.device.map(device => {
            // Log the original device object to see all properties
            console.log('Original device data from API (legacy format):', device);
            
            // IMPORTANT: The API returns partID and deviceRFID arrays - use the exact fields
            const parts = device.partID || [];
            const rfids = device.deviceRFID || [];
            
            // Log parts data to debug
            console.log(`Device ${device.deviceID} parts (raw):`, parts);
            
            // Create properly structured item
            const item = {
              key: device.deviceID.toString(),
              deviceId: device.deviceID,
              name: device.deviceName,
              price: device.price,
              orderDate: device.orderDate,
              arriveDate: device.arriveDate,
              maintenanceDate: device.maintenanceDate,
              roomId: device.roomID,
              state: device.state,
              remark: device.remark,
              docs: device.docs || [],
              // Pass the parts and rfids arrays directly without modification
              parts: parts,
              rfids: rfids
            };
            
            console.log('Transformed item with parts:', item);
            return item;
          });
        }
        
        setItems(deviceData);
        message.success(`Loaded ${deviceData.length} items from selected room`);
      } else {
        // More descriptive error message
        const errorMsg = response.error?.description || response.error || 'Server returned an error';
        console.error(`Failed to load items: ${errorMsg}`, response);
        message.error(`Failed to load items: ${errorMsg}`);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      message.error(`Failed to load items: ${error.message || 'Connection error'}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Normalize upload file list
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

 

  const columns = [
    { title: "Item Name", dataIndex: "name", key: "item-name-col" },
    { 
      title: "Status", 
      dataIndex: "state", 
      key: "status-col",
      render: (state) => {
        /**
         * S = Shipping(運送中), A = Available for loan(可借出), R = Reserve(預留),
         * L = On loan(借出中), E = Expired(過期), B = Broken(壞), W = Waiting for
         * repairs to be completed(等待完成維修), D = Destroyed(棄物), M = Missing(缺失)
         */
        let color = 'green';
        let text = 'Available';
        
        switch(state) {
          case 'S':
            color = 'orange';
            text = 'Shipping';
            break;
          case 'A':
            color = 'green';
            text = 'Available';
            break;
          case 'R':
            color = 'blue';
            text = 'Reserved';
            break;
          case 'L':
            color = 'cyan';
            text = 'On Loan';
            break;
          case 'E':
            color = 'volcano';
            text = 'Expired';
            break;
          case 'B':
            color = 'red';
            text = 'Broken';
            break;
          case 'W':
            color = 'gold';
            text = 'Wait for Repair';
            break;
          case 'D':
            color = 'black';
            text = 'Destroyed';
            break;
          case 'M':
            color = 'purple';
            text = 'Missing';
            break;
          default:
            color = 'default';
            text = 'Unknown';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    { 
      title: "Price", 
      dataIndex: "price", 
      key: "price-col",
      render: (price) => `$${price}`
    },
    { 
      title: "Maintenance Date", 
      dataIndex: "maintenanceDate", 
      key: "maintenance-date-col" 
    },
    {
      title: "Parts",
      dataIndex: "parts",
      key: "parts-col",
      render: (parts) => {
        // Log parts to debug
        console.log('Parts in column render:', parts);
        return parts && parts.length > 0 ? 
          <span>{parts.length} Part{parts.length > 1 ? 's' : ''}</span> : 
          "No parts";
      }
    },
    {
      title: "Action",
      key: "action-col",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showEditModal(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.key)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Filter items based on searchText and ensure all items have unique keys
  const filteredItems = items
    .filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
    .map((item, index) => {
      // Ensure each item has a unique key property
      if (!item.key) {
        return {
          ...item,
          key: `item-${item.deviceId || index}-${Date.now()}`
        };
      }
      return item;
    });

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Manage Item</Title>
        <Space style={{ marginBottom: 16 }}>
        <Select
            placeholder="Select Campus"
            style={{ width: 150 }}
            onChange={handleCampusChange}
            value={selectedCampus}
            loading={loading}
          >
            {campuses.map(campus => (
              <Select.Option key={campus.key} value={campus.key}>
                {campus.shortName}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Select Room"
            style={{ width: 150 }}
            onChange={handleRoomChange}
            value={selectedRoom}
            loading={loading}
            disabled={!selectedCampus}
          >
            {rooms.map((room) => (
              <Select.Option key={room.key} value={room.roomId.toString()}>
                {room.roomNumber} - {room.name}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSort}>
            Select
          </Button>
          <Button type="primary" onClick={showAddModal}>
            Add Item
          </Button>
        </Space>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={items}
            pagination={{ pageSize: 5 }}
            // Ensure each row has a unique identifier for proper expansion control
            rowKey={record => record.deviceId?.toString() || record.key}
            expandable={{
              // Only include the currently expanded row key in this array
              expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
              // Handle expand/collapse actions
              onExpand: (expanded, record) => {
                // If expanding, store this row's key; if collapsing, set to null
                setExpandedRowKey(expanded ? (record.deviceId?.toString() || record.key) : null);
              },
              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <p>
                    <strong>Remark:</strong> {record.remark || 'No remarks'}
                  </p>
                  <p>
                    <strong>Order Date:</strong> {record.orderDate}
                  </p>
                  <p>
                    <strong>Arrival Date:</strong> {record.arriveDate}
                  </p>
                  <div>
                    <strong>Parts & RFIDs:</strong>
                    {record.parts && record.parts.length > 0 ? (
                      <Table
                        dataSource={record.parts.map((part) => {
                          // Log the part for debugging
                          console.log('Processing part for display:', part);
                          
                          // Find matching RFIDs for this part - handle exact API structure
                          const matchingRfids = record.rfids?.filter((r) =>
                            r.devicePartID === part.devicePartID &&
                            r.deviceID === part.deviceID
                          ) || [];
                          
                          // Part can be either {devicePartID, devicePartName} or {deviceID, devicePartID, devicePartName}
                          return {
                            key: `${part.deviceID}-${part.devicePartID}`, // Ensure unique key
                            name: part.devicePartName,
                            rfids: matchingRfids,
                            rfidDisplay: matchingRfids.length > 0 
                              ? matchingRfids.map(r => r.rfid).join(', ') 
                              : 'No RFID'
                          };
                        })}
                        columns={[
                          { title: 'Part Name', dataIndex: 'name', key: 'part-name-col' },
                          { 
                            title: 'RFID Tags', 
                            key: 'rfid-col',
                            render: (_, record) => (
                              <div>
                                {record.rfids && record.rfids.length > 0 ? (
                                  record.rfids.map((rfidItem, index) => (
                                    <Tag 
                                      color="blue" 
                                      closable 
                                      key={index} 
                                      style={{ marginRight: '4px' }}
                                      onClose={(e) => {
                                        // Prevent the default close behavior
                                        e.preventDefault();
                                        // Show confirmation modal
                                        Modal.confirm({
                                          title: 'Delete RFID',
                                          content: 'Are you sure you want to delete this RFID tag?',
                                          okText: 'Delete',
                                          okType: 'danger',
                                          cancelText: 'Cancel',
                                          onOk: () => {
                                            handleDeleteRFID(rfidItem.rfid, record.key.split('-')[0], rfidItem.devicePartID);
                                          }
                                        });
                                      }}
                                    >
                                      {rfidItem.rfid}
                                    </Tag>
                                  ))
                                ) : (
                                  <span>No RFID</span>
                                )}
                              </div>
                            )
                          },
                          { 
                            title: 'Actions', 
                            key: 'part-action-col',
                            render: (_, record) => {
                              // Get first RFID to extract device and part IDs if available
                              if (record.rfids && record.rfids.length > 0) {
                                const rfid = record.rfids[0];
                                // Use actual properties from the RFID data
                                return (
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => showRfidAssignModal(rfid.deviceID, rfid.devicePartID)}
                                  >
                                    Assign RFID
                                  </Button>
                                );
                              } else {
                                // Extract deviceId and partId from the record key as fallback
                                const [deviceId, devicePartId] = record.key.split('-');
                                return (
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => showRfidAssignModal(deviceId, devicePartId)}
                                  >
                                    Assign RFID
                                  </Button>
                                );
                              }
                            }
                          },
                        ]}
                        pagination={false}
                        size="small"
                      />
                    ) : (
                      <p>No parts available</p>
                    )}
                  </div>
                  
                  {/* Document Files Table */}
                  <div style={{ marginTop: '16px' }}>
                    <strong>Document Files:</strong>
                    {record.docs && record.docs.length > 0 ? (
                      <Table
                        dataSource={record.docs.map((doc) => {
                          // Extract filename from path
                          let filename = doc.docPath || '';
                          // Remove the path part and keep only the filename
                          if (filename.includes('/')) {
                            filename = filename.split('/').pop();
                          }
                          
                          return {
                            key: `doc-${doc.id || Math.random()}`,
                            filename: filename || 'Unnamed file',
                            originalPath: doc.docPath || '',
                            deviceId: record.deviceId
                          };
                        })}
                        columns={[
                          { title: 'Filename', dataIndex: 'filename', key: 'doc-filename-col' },
                          { 
                            title: 'Action', 
                            key: 'doc-action-col',
                            render: (_, doc) => (
                              <Space>
                                <Button 
                                  type="link" 
                                  icon={<DownloadOutlined />} 
                                  onClick={() => handleDownloadDocument(doc.deviceId, doc.originalPath)}
                                >
                                  Download
                                </Button>
                                <Popconfirm
                                  title="Delete document"
                                  description="Are you sure you want to delete this document?"
                                  onConfirm={() => handleDeleteDocument(doc.deviceId, doc.originalPath)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <Button 
                                    type="link" 
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    Delete
                                  </Button>
                                </Popconfirm>
                              </Space>
                            )
                          }
                        ]}
                        pagination={false}
                        size="small"
                      />
                    ) : (
                      <p>No document files available</p>
                    )}
                  </div>
                </div>
              ),

            }}
          />
        )}
      </Card>
      <Modal
        title={editingItem ? "Edit Device" : "Add Device"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Campus" name="campus"
            rules={[{ required: true, message: 'Please choose a campus!' }]}>
            <Select
              placeholder="Select Campus"
              style={{ width: '100%' }}
              loading={loading}
              onChange={(value) => {
                form.setFieldsValue({ roomId: undefined });
                fetchRoomsByCampus(value);
              }}
              disabled={editingItem}
            >
              {campuses.map((campus) => (
                <Select.Option key={campus.key} value={campus.key}>
                  {campus.shortName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="roomId"
            label="Room"
            rules={[{ required: true, message: 'Please select a room!' }]}>
            <Select
              placeholder="Select Room"
              style={{ width: '100%' }}
              loading={loading}
            >
              {rooms.map((room) => (
                <Select.Option key={room.key} value={room.roomId.toString()}>
                  {room.roomNumber} - {room.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Device Name"
            rules={[{ required: true, message: "Please input the device name!" }]}
          >
            <Input />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: "Please input the price!" }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} prefix="$" />
            </Form.Item>
            <Form.Item
              name="state"
              label="Status"
              initialValue="A"
              rules={[{ required: true, message: "Please select the status!" }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="S">Shipping</Select.Option>
                <Select.Option value="A">Available for loan</Select.Option>
                <Select.Option value="R">Reserved</Select.Option>
                <Select.Option value="L">On loan</Select.Option>
                <Select.Option value="E">Expired</Select.Option>
                <Select.Option value="B">Broken</Select.Option>
                <Select.Option value="W">Waiting for repairs</Select.Option>
                <Select.Option value="D">Destroyed</Select.Option>
                <Select.Option value="M">Missing</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="orderDate"
              label="Order Date"
              rules={[{ required: true, message: 'Please select a date!' }]}
              style={{ flex: 1 }}    
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="arriveDate"
              label="Arrival Date"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="maintenanceDate"
              label="Maintenance Date"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <Form.Item
            name="remark"
            label="Remarks"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Divider orientation="left">Device Parts</Divider>
          
          {deviceParts.map((part, index) => (
            <div key={part.id} style={{ display: 'flex', marginBottom: '8px', alignItems: 'baseline' }}>
              <div style={{ flex: 1, marginRight: '8px' }}>
                <Input
                  placeholder={`Enter part name ${index + 1}`}
                  value={part.name}
                  onChange={(e) => updatePartName(part.id, e.target.value)}
                />
              </div>
              <Popconfirm
                title="Are you sure you want to remove this part?"
                onConfirm={() => removePart(part.id)}
                okText="Yes"
                cancelText="No"
                disabled={deviceParts.length <= 1}
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  disabled={deviceParts.length <= 1}
                />
              </Popconfirm>
            </div>
          ))}
          
          <Button 
            type="dashed" 
            onClick={addDevicePart} 
            block 
            icon={<PlusOutlined />}
            style={{ marginBottom: '16px' }}
          >
            Add Part
          </Button>
          
          <Form.Item label="Upload Documents" name="files">
            <Upload.Dragger
              name="files"
              multiple={true}
              fileList={fileList}
              beforeUpload={() => false} // Prevent auto upload
              onChange={handleFileChange}
              disabled={!fileUploadEnabled || uploadInProgress}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              {fileUploadEnabled ? (
                <>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Files will be uploaded for device ID: {createdDeviceId}<br/>
                    You can add multiple files before clicking "Finish"
                  </p>
                </>
              ) : deviceCreated ? (
                <p className="ant-upload-text">Please click 'Confirm' to enable file upload</p>
              ) : (
                <>
                  <p className="ant-upload-text">First create the device, then upload files</p>
                  <p className="ant-upload-hint">
                    Upload will be enabled after device creation
                  </p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>
        </Form>
        <Form.Item>
          {deviceCreated ? (
            <>
              <Button type="primary" onClick={handleConfirmDevice} disabled={fileUploadEnabled}>
                Confirm
              </Button>
              {fileUploadEnabled && (
                <>
                  <Button 
                    type="default" 
                    onClick={uploadCurrentBatch} 
                    loading={uploadInProgress} 
                    style={{ marginLeft: 8 }}
                    disabled={fileList.length === 0}
                  >
                    Upload Current Batch
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleOk} 
                    loading={uploadInProgress} 
                    style={{ marginLeft: 8 }}
                    disabled={fileList.length === 0}
                  >
                    Finish {fileList.length > 0 ? `& Upload ${fileList.length} File${fileList.length !== 1 ? 's' : ''}` : ''}
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button type="primary" onClick={handleOk} loading={loading}>
              {editingItem ? "Update" : "Add"}
            </Button>
          )}
          <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Modal>

      {/* RFID Assignment Modal */}
      <Modal
        title="Assign RFID Tag"
        open={rfidModalVisible}
        onCancel={handleRfidModalCancel}
        footer={[
          <Button key="cancel" onClick={handleRfidModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleRfidAssign}>
            Assign
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Form layout="vertical">
            <Form.Item label="Device ID (deviceID)" style={{ marginBottom: '12px' }}>
              <Input value={selectedDeviceId} disabled />
            </Form.Item>
            <Form.Item label="Device Part ID (devicePartID)" style={{ marginBottom: '12px' }}>
              <Input value={selectedPartId} disabled />
            </Form.Item>
            <Form.Item 
              label="RFID Tag" 
              style={{ marginBottom: '12px' }}
              help="This field will be automatically filled by the RFID reader. Do not type manually."
            >
              <Input
                value={rfidValue}
                onChange={(e) => setRfidValue(e.target.value)}
                placeholder="Waiting for RFID scan..."
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </Form.Item>
            <div style={{ marginTop: '12px', color: '#1890ff' }}>
              <p><strong>Instructions:</strong></p>
              <ol>
                <li>Place the RFID tag near the reader</li>
                <li>Wait for the RFID value to appear in the field</li>
                <li>Click 'Assign' to associate this RFID tag with the part</li>
              </ol>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Manual Device ID Input Modal */}
      <Modal
        title="Enter Device ID for File Upload"
        open={manualDeviceIdModalVisible}
        onOk={handleManualDeviceIdSubmit}
        onCancel={handleManualDeviceIdCancel}
        okText="Upload Files"
        cancelText="Cancel"
      >
        <p>The API did not return a device ID, but your device was created successfully. To upload files, please enter the device ID manually:</p>
        <p style={{ color: 'red' }}>You can find the device ID in the device list - it's typically a number.</p>
        <Input
          placeholder="Enter device ID (number only)"
          value={manualDeviceId}
          onChange={(e) => setManualDeviceId(e.target.value)}
          style={{ marginBottom: '15px' }}
        />
      </Modal>
    </div>
  );
};

export default ManageItem;