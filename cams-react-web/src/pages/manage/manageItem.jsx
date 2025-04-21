import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Upload,
  message,
  Modal,
  Select,
  Divider,
  Row,
  Col,
  Space,
  Typography,
  Card,
  Spin,
  notification,
  DatePicker,
  Popconfirm,
  Tag,
  Checkbox,
  Radio
} from "antd";
const { Text } = Typography;
import { 
  UploadOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  SyncOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  DeleteOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileUnknownOutlined, 
  DownloadOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { assetService } from "../../api";
import axiosInstance from "../../api/axios";

// Initialize Electron IPC Renderer if not in browser environment
// Get Electron IPC 
let electron;

try {
  electron = window.require && window.require('electron');
} catch (e) {
  console.log("Running in browser environment, not Electron.");
}

const ipcRenderer = electron?.ipcRenderer;
const inBrowser = !ipcRenderer;
//-----------------------------------------------------------------------
const { Title } = Typography;


const ManageItem = () => {
  // Get RFID context


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
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const rfidOutputRef = useRef(null);
  const containerRef = useRef(null);
  const [rfidValue, setRfidValue] = useState('');
  
  // States for Edit Part modal
  const [editPartModalVisible, setEditPartModalVisible] = useState(false);
  const [editPartDeviceId, setEditPartDeviceId] = useState(null);
  const [editPartPartId, setEditPartPartId] = useState(null);
  const [editPartLoading, setEditPartLoading] = useState(false);
  const [editPartDeviceName, setEditPartDeviceName] = useState('');
  const [editPartDeviceStatus, setEditPartDeviceStatus] = useState('');
  const [editPartForm] = Form.useForm();
  const [availableRfidDevices, setAvailableRfidDevices] = useState([]);


  // State for filtering items by state
  const [stateFilters, setStateFilters] = useState({
    available: true,    // A - Available
    reserved: true,     // R - Reserved
    onloan: true,       // L - On Loan
    expired: true,      // E - Expired
    broken: true,       // B - Broken
    waitingrepair: true, // W - Waiting for Repair
    destroyed: true,    // D - Destroyed
    missing: true,      // M - Missing
    shipping: true      // S - Shipping
  });

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
    // Make a clean copy of the record to set as editingItem to avoid reference issues
    const recordCopy = { ...record };
    setEditingItem(recordCopy);
    
    // Reset file list for the edit modal
    setFileList([]);
    
    // Ensure roomId is not undefined or null for the form
    // This prevents issues with the roomId when updating multiple times
    const roomIdValue = record.roomId ? record.roomId.toString() : '';
    console.log('Setting roomId in form:', roomIdValue, 'from record:', record.roomId);
    
    // Set all fields including dates (now using Input instead of DatePicker for dates in edit mode)
    const formValues = {
      name: record.name,
      price: record.price,
      state: record.state,
      remark: record.remark,
      campus: record.campusId,
      roomId: roomIdValue, // Use our safe roomId value
      orderDate: record.orderDate || '',
      arriveDate: record.arriveDate || '',
      maintenanceDate: record.maintenanceDate || ''
    };
    
    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          await handleDeleteItemById(record.deviceId);
          // Only update the UI if deletion was successful (handled in handleDeleteItemById)
        } catch (error) {
          console.error('Error in delete confirmation:', error);
        } finally {
          setLoading(false);
        }
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
    }finally{
      setLoading(false);
    }
  };
  
 // rfid separate data part
  
  useEffect(() => {

    if (window.ARSInterface && typeof window.ARSInterface.setActivePage === 'function') {
      window.ARSInterface.setActivePage('manageItem');
      console.log('Set active page to: manageItem');
    } else {
      window.activeRFIDPage = 'manageItem';
      console.log('Set activeRFIDPage to: manageItem using fallback');
    }
    // Set focus to this component so it captures RFID events
    if (containerRef.current) {
      containerRef.current.focus();
    }
    // Cleanup when component unmounts
    return () => {
      if (window.ARSInterface && typeof window.ARSInterface.clearActivePage === 'function') {
        window.ARSInterface.clearActivePage();
      } else {
        window.activeRFIDPage = null;
      }
    };
  }, []);

    // Handle focus events to ensure this page captures RFID events when in view
    const handleFocus = () => {
      console.log('Check page received focus');
      if (window.ARSInterface && typeof window.ARSInterface.setActivePage === 'function') {
        window.ARSInterface.setActivePage('check');
      } else {
        window.activeRFIDPage = 'check';
      }
    };
  
      // Listen for RFID data
        useEffect(() => {
          if (inBrowser) {
            // Browser environment - use custom event
            const handleBrowserRfidEvent = (event) => {
              // Log the event to our hidden div for debugging
              if (rfidOutputRef.current) {
                rfidOutputRef.current.innerHTML += `RFID browser event: ${JSON.stringify(event.detail)}<br/>`;
              }
      
              // Example format: {tid: "E280110640000252B96AAD01"}
              if (event.detail && event.detail.tid) {
                console.log('Browser RFID event received:', event.detail.tid);
                setRfidValue(event.detail.tid);
              }
            };
      
            // Listen for browser custom event
            window.addEventListener('rfidData', handleBrowserRfidEvent);
      
            // We'll add the test buttons in the JSX instead for better control
      
            return () => {
              window.removeEventListener('rfidData', handleBrowserRfidEvent);
            };
          } else {
            // Desktop environment - use Electron IPC
            const handleElectronRfidTag = (event, message) => {
              try {
                if (rfidOutputRef.current) {
                  rfidOutputRef.current.innerHTML += `RFID event (Electron): ${message}<br/>`;
                }
      
                const tagObj = JSON.parse(message);
                if (tagObj && tagObj.TID) {
                  console.log('Electron RFID TID received:', tagObj.TID);
                  setRfidValue(tagObj.TID);
                }
              } catch (error) {
                console.error('Error parsing RFID tag data:', error);
              }
            };
      
            // Setup Electron IPC listeners
            ipcRenderer.on('newScannedTag', handleElectronRfidTag);
      
            return () => {
              ipcRenderer.removeListener('newScannedTag', handleElectronRfidTag);
            };
          }
        }, [inBrowser]);
  
    // Function to clear RFID data
    const clearData = () => {
      setRfidValue('');
      if (window.ARSInterface && typeof window.ARSInterface.clearData === 'function') {
        window.ARSInterface.clearData();
        console.log('Clearing RFID data via ARSInterface');
      }
      if (!inBrowser && ipcRenderer) {
        ipcRenderer.send('clearRfid');
        console.log('Sent clearRfid command to Electron');
      }
      console.log('RFID data cleared');
    };
  
  

  
  // Function to handle RFID modal cancel
  const handleRfidModalCancel = () => {
    // Just close the modal without stopping scanning - let global context manage the RFID state
    setRfidModalVisible(false);
    setSelectedDeviceId(null);
    setSelectedPartId(null);
    setRfidValue('');
  };



  // Function to delete Item By Id
  const handleDeleteItemById = async (deviceId) => {
    try {
      setLoading(true);
      const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
      // Prepare data for API call
      const requestData = {
        token: token,
        deviceID: deviceId
      };

      console.log('Sending delete item request with data:', requestData);

      // Call your API to delete the item
      const response = await assetService.deleteItemById(requestData);
      if(response.success){
        message.success('Item deleted successfully');
        // Update the local state to remove the deleted item
        setItems((prev) => prev.filter((item) => item.deviceId !== deviceId));
        handleSort();
      }else{
        message.error('Failed to delete item: ' + (response.error?.description || 'Unknown error'));
      }
      return response;
    }catch(error){
      console.error('Error deleting item:', error);
      message.error(`Error deleting item: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  
  // Function to handle RFID assignment
  const handleRfidAssign = async () => {
    if (!rfidValue) {
      message.error('Please scan an RFID tag first');
      return;
    }

   
    
    try {
      setLoading(true);
      const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
      // Prepare data for API call
      const requestData = {
        token: token,
        deviceID: selectedDeviceId,
        partID: selectedPartId,
        RFID: rfidValue
      };
      
      // Call your API to assign the RFID
      const response = await assetService.assignRFID(requestData);
      
      if (response.success) {
        message.success('RFID tag assigned successfully');
       
        handleSort();
        
        // Close modal and reset states
        handleRfidModalCancel();
      } else {
        message.error(`Failed to assign RFID tag: ${response.error?.description || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning RFID tag:', error);
      message.error(`Error assigning RFID tag: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

        // Refresh the device list
        handleSort();
        
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
      
      // Get dates directly from form values as strings (already in YYYY-MM-DD format from DatePicker)
      const orderDate = values.orderDate || new Date().toISOString().split('T')[0];
      const arriveDate = values.arriveDate || new Date().toISOString().split('T')[0];
      const maintenanceDate = values.maintenanceDate || null;
      const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
      
      if (editingItem) {
        // Handle update device
        // Get roomID - ensure it's never null by using multiple fallbacks
        let roomID = null;
        if (values.roomId && values.roomId !== '') {
          roomID = parseInt(values.roomId, 10);
        } else if (editingItem.roomId && editingItem.roomId !== '') {
          roomID = parseInt(editingItem.roomId, 10);
        } else if (editingItem.roomID) {
          roomID = parseInt(editingItem.roomID, 10);
        }
        
        console.log('Using roomID for update:', roomID, 'from values.roomId:', values.roomId, 'and editingItem:', editingItem);
        
        const deviceData = {
          token: token,
          deviceID: parseInt(editingItem.deviceId, 10), // Ensure deviceID is a number
          deviceName: values.name,
          price: parseFloat(values.price) || 0, // Ensure price is a number
          orderDate: orderDate,
          arriveDate: arriveDate,
          maintenanceDate: maintenanceDate,
          roomID: roomID, // Use our carefully determined roomID
          state: values.state || 'A',
          remark: values.remark || '',
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
            // Don't call handleSort() here - it reloads all devices and overwrites local state
          }
          
          // Update item in local state
          const updatedItems = items.map(item => 
            item.key === editingItem.key ? {
              ...item,
              name: values.name,
              state: values.state,
              price: values.price,
              remark: values.remark,
              // Ensure roomId is preserved
              roomId: values.roomId || editingItem.roomId,
              // Include campusId to ensure it's preserved
              campusId: editingItem.campusId,
              // Update dates
              orderDate: orderDate,
              arriveDate: arriveDate,
              maintenanceDate: maintenanceDate
            } : item
          );
          setItems(updatedItems);
          
          message.success('Device updated successfully');
          setIsModalVisible(false);
          setFileList([]);
          setDeviceParts([{ id: Date.now(), name: '' }]);
          form.resetFields();
          
          // Refresh page data from the server
          handleSort();
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
  
  // Handle manual device ID submission
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
  

  
  // Show Edit Part modal
  const showEditPartModal = (deviceId, partId, partName, status, deviceName = '', deviceStatus = '') => {
    console.log('Opening Edit Part modal with:', { deviceId, partId, partName, status, deviceName, deviceStatus });
    setEditPartDeviceId(deviceId);
    setEditPartPartId(partId);
    setEditPartDeviceName(deviceName);
    setEditPartDeviceStatus(deviceStatus);
    
    // Reset and then set form values with a slight delay to ensure the modal is visible first
    setTimeout(() => {
      editPartForm.resetFields();
      editPartForm.setFieldsValue({
        partName: partName || ''
      });
      console.log('Form values set:', { partName });
    }, 100);
    
    setEditPartModalVisible(true);
  };
  
  // Handle Edit Part submission
  const handleEditPart = async () => {
    try {
      // Validate form fields
      const values = await editPartForm.validateFields();
      setEditPartLoading(true);
      
      console.log('Updating item part with:', {
        deviceID: editPartDeviceId,
        partID: editPartPartId,
        partName: values.partName,
        state: 'A' // Default to 'Available' state when updating name
      });
      
      // Make API call to update item part
      const result = await assetService.updateItemPart({
        deviceID: editPartDeviceId,
        partID: editPartPartId,
        partName: values.partName,
        state: 'A' // Default to 'Available' state when updating name
      });
      
      if (result.status) {
        message.success('Item part updated successfully');
        setEditPartModalVisible(false);
        handleSort(); // Refresh the device list
      } else {
        message.error('Failed to update item part');
      }
    } catch (error) {
      console.error('Error updating item part:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('An error occurred while updating the item part');
      }
    } finally {
      setEditPartLoading(false);
    }
  };
  
  // Handle Destroy Part action
  const handleDestroyPart = async () => {
    try {
      Modal.confirm({
        title: 'Confirm Destruction',
        content: 'Are you sure you want to mark this part as destroyed? This action cannot be undone.',
        okText: 'Yes, Destroy',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          setEditPartLoading(true);
          
          // Get the current part name from the form
          const values = await editPartForm.validateFields();
          
          console.log('Marking part as destroyed:', {
            deviceID: editPartDeviceId,
            partID: editPartPartId,
            partName: values.partName,
            state: 'D' // 'D' for Destroyed
          });
          
          // Make API call to update item part status to Destroyed
          const result = await assetService.updateItemPart({
            deviceID: editPartDeviceId,
            partID: editPartPartId,
            partName: values.partName,
            state: 'D' // 'D' for Destroyed
          });
          
          if (result.status) {
            message.success('Item part marked as destroyed');
            setEditPartModalVisible(false);
            handleSort(); // Refresh the device list
          } else {
            message.error('Failed to mark item part as destroyed');
          }
          
          setEditPartLoading(false);
        },
      });
    } catch (error) {
      console.error('Error destroying item part:', error);
      message.error('An error occurred while processing your request');
      setEditPartLoading(false);
    }
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
  
  // Handle state filter checkbox changes
  const handleStateFilterChange = (filterName, checked) => {
    let newFilters = { ...stateFilters };
    newFilters[filterName] = checked;
    setStateFilters(newFilters);
  };

  // Fetch devices by room ID
  const handleSort = async () => {
    if (!selectedRoom) {
      message.warning('Please select a room first');
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine which state filters to use
      let stateList = [];
      if (stateFilters.available) stateList.push('A');
      if (stateFilters.reserved) stateList.push('R');
      if (stateFilters.onloan) stateList.push('L');
      if (stateFilters.expired) stateList.push('E');
      if (stateFilters.broken) stateList.push('B');
      if (stateFilters.waitingrepair) stateList.push('W');
      if (stateFilters.destroyed) stateList.push('D');
      if (stateFilters.missing) stateList.push('M');
      if (stateFilters.shipping) stateList.push('S');
      
      // If no filters are selected, don't send stateList (will fetch all items)
      if (stateList.length === 0) {
        console.log('No filters selected, fetching all items');
      }
      
      console.log('Using state filters:', stateList.length > 0 ? stateList : 'All states');
      
      const response = await assetService.getItemsByRoom(selectedRoom, stateList);
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
      render: (_, record) => {
        // Don't show Edit and Delete buttons for destroyed items (state 'D')
        if (record.state === 'D') {
          return <Tag color="black">Destroyed</Tag>;
        }
        return (
          <Space size="middle">
            <Button onClick={() => showEditModal(record)}>Edit</Button>
            <Button danger onClick={() => handleDelete(record)}>Delete</Button>
          </Space>
        );
      },
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
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space>
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
          </Space>
          
          {/* State filter checkboxes */}
          <Space>
            <span style={{ marginRight: '8px' }}><FilterOutlined /> State filters:</span>
            <Checkbox 
              checked={stateFilters.available} 
              onChange={(e) => handleStateFilterChange('available', e.target.checked)}
            >
              <Tag color="green">Available</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.reserved} 
              onChange={(e) => handleStateFilterChange('reserved', e.target.checked)}
            >
              <Tag color="blue">Reserved</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.onloan} 
              onChange={(e) => handleStateFilterChange('onloan', e.target.checked)}
            >
              <Tag color="cyan">On Loan</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.expired} 
              onChange={(e) => handleStateFilterChange('expired', e.target.checked)}
            >
              <Tag color="volcano">Expired</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.broken} 
              onChange={(e) => handleStateFilterChange('broken', e.target.checked)}
            >
              <Tag color="red">Broken</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.waitingrepair} 
              onChange={(e) => handleStateFilterChange('waitingrepair', e.target.checked)}
            >
              <Tag color="gold">Wait for Repair</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.destroyed} 
              onChange={(e) => handleStateFilterChange('destroyed', e.target.checked)}
            >
              <Tag color="black">Destroyed</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.missing} 
              onChange={(e) => handleStateFilterChange('missing', e.target.checked)}
            >
              <Tag color="purple">Missing</Tag>
            </Checkbox>
            <Checkbox 
              checked={stateFilters.shipping} 
              onChange={(e) => handleStateFilterChange('shipping', e.target.checked)}
            >
              <Tag color="orange">Shipping</Tag>
            </Checkbox>
          </Space>
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
                                  <Space>
                                    <Button 
                                      type="primary" 
                                      size="small"
                                      onClick={() => {
                                        setSelectedDeviceId(rfid.deviceID);
                                        setSelectedPartId(rfid.devicePartID);
                                        setRfidModalVisible(true);
                                      }}
                                    >
                                      Assign RFID
                                    </Button>
                                    <Button 
                                      type="default" 
                                      size="small"
                                      onClick={() => {
                                        // Log the click to debug
                                        console.log('Edit Part button clicked with:', {
                                          deviceId: rfid.deviceID,
                                          partId: rfid.devicePartID,
                                          name: record.name,
                                          status: record.status,
                                          deviceName: record.device?.name || '',
                                          deviceStatus: record.device?.state || ''
                                        });
                                        showEditPartModal(rfid.deviceID, rfid.devicePartID, record.name, record.status, record.device?.name, record.device?.state);
                                      }}
                                    >
                                      Edit Part
                                    </Button>
                                  </Space>
                                );
                              } else {
                                // Extract deviceId and partId from the record key as fallback
                                const [deviceId, devicePartId] = record.key.split('-');
                                return (
                                  <Space>
                                    <Button 
                                      type="primary" 
                                      size="small"
                                      onClick={() => {
                                        setSelectedDeviceId(deviceId);
                                        setSelectedPartId(devicePartId);
                                        setRfidModalVisible(true);
                                      }}
                                    >
                                      Assign RFID
                                    </Button>
                                    <Button 
                                      type="default" 
                                      size="small"
                                      onClick={() => {
                                        // Log the click to debug
                                        console.log('Edit Part button clicked with:', {
                                          deviceId,
                                          partId: devicePartId,
                                          name: record.name,
                                          status: record.status,
                                          deviceName: record.device?.name || '',
                                          deviceStatus: record.device?.state || ''
                                        });
                                        showEditPartModal(deviceId, devicePartId, record.name, record.status, record.device?.name, record.device?.state);
                                      }}
                                    >
                                      Edit Part
                                    </Button>
                                  </Space>
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
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          {/* Only show Campus and Room selection when adding a new device */}
          {!editingItem && (
            <>
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
            </>
          )}
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
            {editingItem ? (
              /* In edit mode, use simple Input fields for dates to avoid DatePicker validation issues */
              <>
                <Form.Item
                  name="orderDate"
                  label="Order Date"
                  style={{ flex: 1 }}    
                  initialValue={editingItem.orderDate || ''}
                >
                  <Input placeholder="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="arriveDate"
                  label="Arrival Date"
                  style={{ flex: 1 }}
                  initialValue={editingItem.arriveDate || ''}
                >
                  <Input placeholder="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="maintenanceDate"
                  label="Maintenance Date"
                  style={{ flex: 1 }}
                  initialValue={editingItem.maintenanceDate || ''}
                >
                  <Input placeholder="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </>
            ) : (
              /* In add mode, use DatePicker as normal */
              <>
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
              </>
            )}
          </div>
          
          <Form.Item
            name="remark"
            label="Remarks"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          {/* Only show Device Parts section when adding a new device */}
          {!editingItem && (
            <>
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
            </>
          )}
          
          {/* Show different upload section based on mode */}
          {editingItem ? (
            <Form.Item label="Upload Additional Documents" name="files">
              <Upload.Dragger
                name="files"
                multiple={true}
                fileList={fileList}
                beforeUpload={() => false} // Prevent auto upload
                onChange={handleFileChange}
                disabled={uploadInProgress}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag files to this area to upload additional documents</p>
                <p className="ant-upload-hint">
                  Files will be added to device ID: {editingItem.deviceId}
                </p>
              </Upload.Dragger>
            </Form.Item>
          ) : (
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
          )}
          {/* Form Buttons */}
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
              <>
                <Button type="primary" onClick={handleOk} loading={loading}>
                  {editingItem ? "Update" : "Add"}
                </Button>
                <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
                  Cancel
                </Button>
              </>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* RFID Assignment Modal */}
      <Modal
       ref={containerRef} 
       tabIndex={0} 
       onFocus={handleFocus}
        title="Assign RFID Tag"
        open={rfidModalVisible}
        onCancel={handleRfidModalCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleRfidModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleRfidAssign} disabled={!rfidValue}>
            Assign
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Device ID (deviceID)" style={{ marginBottom: '8px' }}>
                  <Input value={selectedDeviceId} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
              <Form.Item name="returnItem" label="RFID Status">
                <div className="rfid-status-box" style={{
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: rfidValue ? '#f6ffed' : '#f5f5f5',
                  borderColor: rfidValue ? '#b7eb8f' : '#d9d9d9',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '16px'
                }}>
                  {rfidValue ? (
                    <>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px', marginRight: '8px' }} />
                      <Text strong>RFID Tag Detected: {rfidValue}</Text>
                    </>
                  ) : (
                    <Text type="secondary">Waiting for RFID scan...</Text>
                  )}
                </div>

              </Form.Item>
              </Col>
            </Row>
            
            {/* Simplified UI - Just a clear button */}
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} style={{ textAlign: 'right' }}>
                <Button 
                  onClick={() => {
                    // Clear data via global context
                    clearData();
                    // Also clear the RFID value in this component
                    setRfidValue('');
                  }}
                >
                  Clear
                </Button>
              </Col>
            </Row>
            
            {/* Hide debug output from UI but keep the ref for logging */}
            <div
              ref={rfidOutputRef}
              style={{
                display: 'none' // Hide the log from users
              }}
            ></div>
            
            <Form.Item 
              label="RFID Tag (TID)" 
              style={{ marginBottom: '12px' }}
              help="This field will be automatically filled when an RFID tag is scanned. Do not type manually."
            >
              <Input
                value={rfidValue}
                onChange={(e) => setRfidValue(e.target.value)}
                placeholder="Waiting for RFID scan..."
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </Form.Item>
            
            {/* Simplified instructions */}
            <div style={{ marginTop: '12px', color: '#1890ff' }}>
              <p><strong>Instructions:</strong></p>
              <ol>
                <li>Place the RFID tag near the reader</li>
                <li>The TID will automatically appear in the field</li>
                <li>Click 'Assign' to save</li>
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
      
      {/* Edit Part Modal */}
      <Modal
        title="Edit Part"
        open={editPartModalVisible}
        onOk={handleEditPart}
        onCancel={() => setEditPartModalVisible(false)}
        confirmLoading={editPartLoading}
        destroyOnClose={true}
        mask={true}
        maskClosable={false}
        zIndex={1001}
      >
        {/* Display device information */}
        {(editPartDeviceName || editPartDeviceStatus) && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Device Info:</strong>
            </div>
            {editPartDeviceName && (
              <div>
                <strong>Device Name:</strong> {editPartDeviceName}
              </div>
            )}
            {editPartDeviceStatus && (
              <div>
                <strong>Device Status:</strong> {
                  editPartDeviceStatus === 'A' ? 'Available' :
                  editPartDeviceStatus === 'R' ? 'Reserved' :
                  editPartDeviceStatus === 'L' ? 'On Loan' :
                  editPartDeviceStatus === 'E' ? 'Expired' :
                  editPartDeviceStatus === 'B' ? 'Broken' :
                  editPartDeviceStatus === 'W' ? 'Waiting for Repairs' :
                  editPartDeviceStatus === 'D' ? 'Destroyed' :
                  editPartDeviceStatus === 'M' ? 'Missing' :
                  editPartDeviceStatus === 'S' ? 'Shipping' :
                  editPartDeviceStatus
                }
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <strong>Device ID:</strong> {editPartDeviceId}, <strong>Part ID:</strong> {editPartPartId}
            </div>
          </div>
        )}
        <Form 
          form={editPartForm} 
          layout="vertical" 
          preserve={false}
          initialValues={{ partName: '' }}
        >
          <Form.Item 
            name="partName" 
            label="Part Name"
            rules={[{ required: true, message: 'Please enter part name' }]}
          >
            <Input placeholder="Enter part name" />
          </Form.Item>
          
          {/* Destroy button outside of form item */}
          <div style={{ marginTop: '20px' }}>
            <Button 
              danger 
              type="primary" 
              onClick={() => handleDestroyPart()}
              icon={<DeleteOutlined />}
              style={{ width: '100%' }}
            >
              Mark as Destroyed
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageItem;