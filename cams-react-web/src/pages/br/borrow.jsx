import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Input, Button, notification, Select, Row, Col, Spin, Typography, Divider, Tabs, Table, Space, DatePicker, Descriptions, Checkbox } from "antd";
import { ScanOutlined, ClearOutlined, CheckCircleOutlined, HistoryOutlined, FileSearchOutlined, BookOutlined } from '@ant-design/icons';
import "./borrow.css"; // css file
// insert react redux hooks
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../api/axios";
import { borrowSuccess } from "../../store/modules/borrowSlice";
import { assetService } from "../../api";
import { reserveItem } from "../../api/services/asset";
import { useAuth } from "../../context/AuthContext";

// Get electron IPC if we're in the desktop app
let electron;
try {
  electron = window.require && window.require('electron');
} catch (e) {
  console.log('Running in browser environment');
}
const ipcRenderer = electron?.ipcRenderer;
const inBrowser = !ipcRenderer;

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Borrow = () => {
  const [borrowForm] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rfidValue, setRfidValue] = useState('');
  const rfidOutputRef = useRef(null);
  const containerRef = useRef(null);
  const { items } = useSelector((state) => state.borrow);
  const authContext = useAuth();

  const [tempCNAValue, setTempCNAValue] = useState('');

  const [recordsParams, setRecordsParams] = useState({
    page: 1,
    pageSize: 10,
    borrowDateAfter: null,
    returned: false,
    targetCNA: null
  });

  useEffect(() => {
    setTempCNAValue(recordsParams.targetCNA || '');
  }, [recordsParams.targetCNA]);

  // Set a page identifier when component mounts
  useEffect(() => {
    console.log('Current access level:', authContext.getAccessLevel());
    // Set the current active page to borrow
    if (window.ARSInterface && typeof window.ARSInterface.setActivePage === 'function') {
      window.ARSInterface.setActivePage('borrow');
      console.log('Set active page to: borrow');
    } else {
      // Fallback if ARSInterface is not available
      window.activeRFIDPage = 'borrow';
      console.log('Set activeRFIDPage to: borrow using fallback');
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
    console.log('Borrow page received focus');
    if (window.ARSInterface && typeof window.ARSInterface.setActivePage === 'function') {
      window.ARSInterface.setActivePage('borrow');
    } else {
      window.activeRFIDPage = 'borrow';
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
    // Clear the RFID value in the local state
    setRfidValue('');
    
    // Clear browser interface if available
    if (window.ARSInterface && typeof window.ARSInterface.clearData === 'function') {
      window.ARSInterface.clearData();
      console.log('Clearing RFID data via ARSInterface');
    }
    
    // Clear desktop interface if available
    if (!inBrowser && ipcRenderer) {
      ipcRenderer.send('clearRfid');
      console.log('Sent clearRfid command to Electron');
    }
    
    console.log('RFID data cleared');
  };

  const handleConfirmBorrow = async () => {
    try {
      // Validate form fields first
      const values = await borrowForm.validateFields();
      
      if (!rfidValue) {
        notification.error({
          message: "Borrowing Failed",
          description: "Please scan an RFID tag first.",
        });
        return;
      }
      
      if (!values.endDate) {
        notification.error({
          message: "Borrowing Failed",
          description: "Please select an end date for borrowing.",
        });
        return;
      }
      
      setLoading(true);
      
      // First get device details by RFID
      try {
        const deviceResponse = await assetService.getDeviceIdByRFID(rfidValue);
        
        if (!deviceResponse.success) {
          throw new Error(deviceResponse.error || 'Failed to get device information');
        }
        
        // Make sure we have the required device information
        const deviceData = deviceResponse.data;
        if (!deviceData.deviceID) {
          throw new Error('Device ID not found in the response');
        }
        
        console.log('Device found:', deviceResponse.data);
        
        // Format the date as YYYY-MM-DD
        const formattedEndDate = values.endDate.format('YYYY-MM-DD');
        
        // Call borrowItem API with the deviceID and endDate
        const borrowResponse = await assetService.borrowItem({
          itemID: deviceData.deviceID,
          endDate: formattedEndDate
        });
        
        if (!borrowResponse.success) {
          throw new Error(borrowResponse.error || 'Failed to borrow item');
        }
        
        // Update redux store if needed
        dispatch(borrowSuccess([deviceData]));
        
        notification.success({
          message: "Borrowing Completed",
          description: `${deviceData.deviceName} has been borrowed successfully. Return date: ${formattedEndDate}`,
        });
        
        // Reset the form and RFID value
        borrowForm.resetFields();
        setRfidValue('');
      } catch (error) {
        console.error('Error retrieving device by RFID:', error);
        
        // Check for the specific error message
        if (error.message && error.message.includes('Device has existed')) {
          notification.error({
            message: "Borrowing Failed",
            description: "This device is already borrowed or assigned to someone else.",
          });
        } else {
          // Format error message properly
          let errorMessage = "An unknown error occurred";
          
          if (error.message) {
            errorMessage = error.message;
          }
          
          // Handle case where error is an object
          if (typeof error === 'object' && error !== null) {
            if (error.toString() === '[object Object]') {
              errorMessage = JSON.stringify(error);
            }
          }
          
          notification.error({
            message: "Borrowing Failed",
            description: errorMessage,
          });
        }
      }
      

      
    } catch (error) {
      // This catch block will only handle errors not caught in the inner try-catch
      console.error('Unhandled error in borrow process:', error);
      
      // Format error message properly
      let errorMessage = "An unknown error occurred";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle case where error is an object
      if (typeof error === 'object' && error !== null) {
        if (error.toString() === '[object Object]') {
          errorMessage = JSON.stringify(error);
        }
      }
      
      notification.error({
        message: "Borrowing Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // State for the Reserve tab
  const [reserveForm] = Form.useForm();
  const [reserveLoading, setReserveLoading] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // State for Borrow Record tab
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [borrowRecords, setBorrowRecords] = useState([]);
  
  // Function to fetch campus data
  const fetchCampuses = async () => {
    try {
      setReserveLoading(true);
      
      // Get token from authorization header
      const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
      
      // Make direct API call to ensure we get the data
      const response = await axiosInstance.post('getcampus', { token });
      
      console.log('Campus data direct response:', response.data);
      
      // Check for the correct property ('c' instead of 'campus')
      if (response.data && response.data.c && Array.isArray(response.data.c)) {
        const formattedCampuses = response.data.c.map(campus => ({
          id: campus.campusId,  // Note: campusId, not campusID
          name: campus.campusName,
          shortName: campus.campusShortName
        }));
        setCampuses(formattedCampuses);
        console.log('Formatted campuses:', formattedCampuses);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setCampuses([]);
      }
    } catch (error) {
      console.error('Failed to fetch campus data:', error);
      notification.error({
        message: 'Failed to load campus data',
        description: error.message || 'Unknown error'
      });
      setCampuses([]);
    } finally {
      setReserveLoading(false);
    }
  };
  
  // Call this once when component mounts
  useEffect(() => {
    fetchCampuses();
  }, []);

  // Function to handle tab change
  const handleTabChange = (activeKey) => {
    console.log('Active tab:', activeKey);
    // Load data based on the active tab
    if (activeKey === '2') { // Reserve tab
      fetchCampuses();
    } else if (activeKey === '3') { // Borrow Records tab
      fetchBorrowRecords();
    }
  };

// Handle campus change - fetch rooms for selected campus
const handleCampusChange = (value) => {
  console.log('Selected campus:', value);
  setSelectedCampus(value);
  setSelectedRoom(null); // Reset room selection when campus changes
  setDevices([]); // Clear devices when campus changes
  reserveForm.setFieldsValue({ roomId: undefined, itemId: undefined });
  
  if (value) {
    fetchRoomsByCampus(value);
  } else {
    setRooms([]);
  }
};

// Fetch rooms by campus ID
const fetchRoomsByCampus = async (campusId) => {
  try {
    setReserveLoading(true);
    
    // Get token from authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Make direct API call
    const response = await axiosInstance.post('getrooms', {
      token: token,
      campusID: campusId
    });
    
    console.log('Rooms data direct response:', response.data);
    
    // Check for different room data structures based on the response log
    // Log the full response to better understand the structure
    console.log('Full rooms response structure:', response.data);
    
    if (response.data) {
      let roomArray = [];
      
      // Handle different possible room data structures
      if (response.data.rooms && Array.isArray(response.data.rooms)) {
        roomArray = response.data.rooms;
      } else if (response.data.r && Array.isArray(response.data.r)) {
        roomArray = response.data.r;
      } else if (response.data.room && Array.isArray(response.data.room)) {
        roomArray = response.data.room;
      }
      
      if (roomArray.length > 0) {
        const formattedRooms = roomArray.map(room => ({
          id: room.room || room.roomId || room.roomID,
          name: room.roomName || room.name,
          number: room.roomNumber || ''
        }));
        console.log('Formatted rooms:', formattedRooms);
        setRooms(formattedRooms);
      } else {
        console.log('No rooms found in response');
        setRooms([]);
      }
    } else {
      notification.error({
        message: 'Failed to load rooms',
        description: 'No rooms found in this campus'
      });
      setRooms([]);
    }
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    notification.error({
      message: 'Failed to load rooms',
      description: error.message || 'Unknown error'
    });
    setRooms([]);
  } finally {
    setReserveLoading(false);
  }
};

// Handle room change
const handleRoomChange = (value) => {
  console.log('Selected room:', value);
  setSelectedRoom(value);
  setDevices([]); // Clear devices when room changes
  reserveForm.setFieldsValue({ itemId: undefined });

  if (value) {
    fetchDevicesByRoom(value);
  }
};

// Function to fetch devices by room
const fetchDevicesByRoom = async (roomId) => {
  if (!roomId) return;

  
  try {
    setReserveLoading(true);
    
    // Get token from authorization header
    const token = axiosInstance.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    
    // Make direct API call
    const response = await axiosInstance.post('getitems', {
      token: token,
      roomID: roomId
    });
    
    console.log('Devices data direct response:', response.data);
    
    // Log full response for debugging
    console.log('Full devices response structure:', response.data);
    
    // Check for device property or direct array
    if (response.data) {
      let deviceArray = [];
      
      // Handle different possible response structures
      if (Array.isArray(response.data)) {
        deviceArray = response.data;
      } else if (response.data.device && Array.isArray(response.data.device)) {
        deviceArray = response.data.device;
      } else if (response.data.d && Array.isArray(response.data.d)) {
        deviceArray = response.data.d;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        deviceArray = response.data.items;
      } else if (response.data.devices && Array.isArray(response.data.devices)) {
        deviceArray = response.data.devices;
      }
      
      // Filter devices that are available (state 'A')
      const availableDevices = deviceArray
        .filter(device => device.state === 'A')
        .map(device => ({
          deviceId: device.deviceId || device.deviceID,  // Handle both naming conventions
          name: device.deviceName || device.name,
          state: device.state,
          roomId: device.roomId || device.roomID
        }));
      
      console.log('Formatted devices:', availableDevices);
      setDevices(availableDevices);
    } else {
      setDevices([]);
      notification.error({
        message: 'No available devices',
        description: 'No available devices found in this room'
      });
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    notification.error({
      message: 'Failed to fetch device data',
      description: error.message || 'Unknown error'
    });
    setDevices([]);
  } finally {
    setReserveLoading(false);
  }
};

  
  // Mock function to fetch borrow records
  const fetchBorrowRecords = async () => {
    try {
      setRecordsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock data with new structure
      const mockRecords = [
        { 
          id: 1, 
          borrowDate: "2025-04-09",
          leasePeriod: "2025-04-30",
          deviceName: "Laptop",
          borrowerCNA: "123456789",
          borrowerFirstName: "John",
          borrowerLastName: "Doe",
          returnDate: null,
          checkDate: null,
          inspectorCNA: null,
          inspectorFirstName: null,
          inspectorLastName: null,
          roomNumber: "301",
          roomName: "Computer Lab",
          campusShortName: "IVE(CW)"
        },
        { 
          id: 2, 
          borrowDate: "2025-04-05",
          leasePeriod: "2025-05-15",
          deviceName: "Projector", 
          borrowerCNA: "987654321",
          borrowerFirstName: "Jane",
          borrowerLastName: "Smith",
          returnDate: null,
          checkDate: null,
          inspectorCNA: null,
          inspectorFirstName: null,
          inspectorLastName: null,
          roomNumber: "205",
          roomName: "Lecture Hall",
          campusShortName: "IVE(CW)"
        },
        { 
          id: 3, 
          borrowDate: "2025-03-25",
          leasePeriod: "2025-04-25",
          deviceName: "Tablet", 
          borrowerCNA: "567891234",
          borrowerFirstName: "Alex",
          borrowerLastName: "Wong",
          returnDate: "2025-04-10",
          checkDate: "2025-04-10",
          inspectorCNA: "111222333",
          inspectorFirstName: "Mary",
          inspectorLastName: "Chen",
          roomNumber: "349",
          roomName: "InnoLab",
          campusShortName: "IVE(CW)"
        }
      ];
      setBorrowRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      notification.error({
        message: 'Failed to fetch records',
        description: error.toString()
      });
    } finally {
      setRecordsLoading(false);
    }
  };
  

  
  // Function for item reservation
  const handleReserveItem = async () => {
    try {
      const values = await reserveForm.validateFields();
      setReserveLoading(true);
      
      // Validate date period
      const startDate = values.startDate;
      const endDate = values.endDate;
      
      // Calculate the difference in days
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        notification.error({
          message: 'Invalid Date Range',
          description: 'The reservation period cannot exceed 30 days.'
        });
        setReserveLoading(false);
        return;
      }
      
      // Format the end date as YYYY-MM-DD
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      // Call the reserveItem service function
      const result = await reserveItem(values.itemId, formattedStartDate, formattedEndDate);
      
      if (result.success) {
        notification.success({
          message: 'Reservation Successful',
          description: `Item has been successfully reserved until ${formattedEndDate}`
        });
        
        // Reset form and reload devices
        reserveForm.resetFields();
        if (selectedRoom) {
          fetchDevicesByRoom(selectedRoom);
        }
      } else {
        // Handle error response
        notification.error({
          message: 'Reservation Failed',
          description: result.error
        });
      }
    } catch (error) {
      console.error('Reservation error:', error);
      notification.error({
        message: 'Reservation Failed',
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setReserveLoading(false);
    }
  };
  
  // Get current date (start of day to avoid time comparison issues)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Function to disable dates before today for start date picker
  const disabledStartDate = (current) => {
    return current && current < today;
  };
  
  // Function to disable dates for end date picker
  // Prevents selecting dates before start date or more than 30 days after start date
  const disabledEndDate = (current) => {
    const startDate = reserveForm.getFieldValue('startDate');
    
    if (!startDate) {
      // If no start date is selected yet, disable all dates before today
      return current && current < today;
    }
    
    // Convert to date objects for comparison (remove time component)
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    
    // Calculate max date (30 days after start date)
    const maxDate = new Date(startDateObj);
    maxDate.setDate(startDateObj.getDate() + 30);
    
    // Disable dates before start date or after max date
    return current && (current < startDateObj || current > maxDate);
  };
  
  // Borrow Tab Content
  const BorrowTabContent = () => (
    <Spin spinning={loading}>
      <Form form={borrowForm} layout="vertical">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24}>
            <Form.Item label="RFID Tag Input">
              <Input
                readOnly
                value={rfidValue}
                onChange={(e) => setRfidValue(e.target.value)}
                placeholder="Scan or enter RFID tag..."
                suffix={
                  rfidValue ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : null
                }
                style={{ fontSize: '16px' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item label="RFID Status">
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
          
          <Col xs={24}>
            <Form.Item 
              name="endDate" 
              label="Return Date" 
              rules={[{ required: true, message: 'Please select a return date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={disabledEndDate}
                inputReadOnly={true}
                placeholder="Select return date (within 30 days)"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={24}>
          <Col span={12}> 
            <Button 
              icon={<ClearOutlined />} 
              onClick={() => {
                clearData();
                setRfidValue('');
              }}
              style={{ width: '100%', height: '40px' }}
            >
              Clear RFID
            </Button>
          </Col>
    
          <Col span={12}>
            <Button 
              type="primary" 
              icon={<ScanOutlined />}
              onClick={handleConfirmBorrow}
              disabled={!rfidValue}
              style={{ width: '100%', height: '40px' }}
            >
              Confirm Borrow
            </Button>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f0f5ff', borderRadius: 8 }}>
          <Title level={5} style={{ marginBottom: 12 }}>Instructions:</Title>
          <ol style={{ paddingLeft: 24, margin: 0 }}>
            <li>Place the RFID tag near the reader</li>
            <li>Verify the RFID tag has been detected</li>
            <li>Select a return date (within 30 days)</li>
            <li>Click "Confirm Borrow" to complete the borrowing process</li>
          </ol>
        </div>
      </Form>
    </Spin>
  );
  
  // Reserve Tab Content
  const ReserveTabContent = () => (
    <Spin spinning={reserveLoading}>
      <Form form={reserveForm} layout="vertical" onFinish={handleReserveItem}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item 
              name="campusId" 
              label="Campus" 
              rules={[{ required: true, message: 'Please select a campus' }]}
            >
              <Select 
                placeholder="Select a campus" 
                onChange={handleCampusChange}
                disabled={reserveLoading}
              >
                {campuses.map(campus => (
                  <Select.Option key={campus.id} value={campus.id}>
                    {campus.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="roomId"
              label="Room"
              rules={[{ required: true, message: 'Please select a room' }]}
            >
              <Select 
                placeholder="Select a room" 
                onChange={handleRoomChange}
                disabled={reserveLoading || !selectedCampus}
              >
                {rooms.map(room => (
                  <Select.Option key={room.id} value={room.id}>
                    {room.name} ({room.number})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item 
              name="itemId" 
              label="Device" 
              rules={[{ required: true, message: 'Please select a device to reserve' }]}
            >
              <Select 
                placeholder="Select a device to reserve"
                disabled={reserveLoading || !selectedRoom}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {devices.map(device => (
                  <Select.Option key={device.deviceId} value={device.deviceId}>
                    {device.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select a start date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={disabledStartDate}
                inputReadOnly={true}
                onChange={(date) => {
                  // When start date changes, validate end date
                  const endDate = reserveForm.getFieldValue('endDate');
                  if (endDate) {
                    // Force revalidation of end date
                    reserveForm.validateFields(['endDate']);
                  }
                }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select an end date' }]}
              extra="Reservation period cannot exceed 30 days"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={disabledEndDate}
                inputReadOnly={true}
              />
            </Form.Item>
          </Col>
          

        </Row>
        
        <Row justify="end">
          <Col>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<BookOutlined />}
              onClick={handleReserveItem}
              disabled={reserveLoading || !selectedRoom || devices.length === 0}
            >
              Submit Reservation
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
  

  
  // Borrow Records Tab Content
  const BorrowRecordsTabContent = () => {
    // Local state for CNA input to prevent focus issues
    const [tempCNAValue, setTempCNAValue] = useState(recordsParams.targetCNA || '');

    useEffect(() => {
      setTempCNAValue(recordsParams.targetCNA || '');
    }, [recordsParams.targetCNA]);

    // Define the columns to show all available fields
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'deviceName',
        key: 'deviceName',
        sorter: (a, b) => a.deviceName.localeCompare(b.deviceName),
      },
      {
        title: 'Campus',
        dataIndex: 'campusShortName',
        key: 'campusShortName',
      },
      {
        title: 'Room Number',
        dataIndex: 'roomNumber',
        key: 'roomNumber',
      },
      {
        title: 'Room Name',
        dataIndex: 'roomName',
        key: 'roomName',
      },
      {
        title: 'Borrower First Name',
        dataIndex: 'borrowerFirstName',
        key: 'borrowerFirstName',
      },
      {
        title: 'Borrower Last Name',
        dataIndex: 'borrowerLastName',
        key: 'borrowerLastName',
      },
      {
        title: 'Borrower CNA',
        dataIndex: 'borrowerCNA',
        key: 'borrowerCNA',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
      {
        title: 'Borrow Date',
        dataIndex: 'borrowDate',
        key: 'borrowDate',
        sorter: (a, b) => new Date(a.borrowDate) - new Date(b.borrowDate),
      },
      {
        title: 'Lease Period',
        dataIndex: 'leasePeriod',
        key: 'leasePeriod',
      },
      {
        title: 'Return Date',
        dataIndex: 'returnDate',
        key: 'returnDate',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
      {
        title: 'Check Date',
        dataIndex: 'checkDate',
        key: 'checkDate',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
      {
        title: 'Inspector CNA',
        dataIndex: 'inspectorCNA',
        key: 'inspectorCNA',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
      {
        title: 'Inspector First Name',
        dataIndex: 'inspectorFirstName',
        key: 'inspectorFirstName',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
      {
        title: 'Inspector Last Name',
        dataIndex: 'inspectorLastName',
        key: 'inspectorLastName',
        render: (text) => {
          if (text) {
            return text;
          }
          return '-';
        }
      },
    ];
    
    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Form.Item label="Borrow Date After" style={{ marginBottom: 0 }}>
              <DatePicker 
                style={{ width: '100%' }}
                onChange={(date) => {
                  setRecordsParams({
                    ...recordsParams,
                    borrowDateAfter: date
                  });
                }}
                inputReadOnly={true}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Include Returned" style={{ marginBottom: 0 }}>
              <Checkbox 
                checked={recordsParams.returned}
                onChange={(e) => {
                  setRecordsParams({
                    ...recordsParams,
                    returned: e.target.checked
                  });
                }}
              >
                Show Returned Items
              </Checkbox>
            </Form.Item>
          </Col>

          {authContext.getAccessLevel() < 1000 && (
            <Col xs={24} md={8}>
              <Form.Item label="Target CNA" style={{ marginBottom: 0 }}>
                <Input 
                  placeholder="Enter CNA"
                  value={tempCNAValue}
                  onChange={(e) => {
                    setTempCNAValue(e.target.value);
                  }}
                  onBlur={() => {
                    setRecordsParams({
                      ...recordsParams,
                      targetCNA: tempCNAValue.length > 0 ? tempCNAValue : null
                    });
                  }}
                  maxLength={9}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Maximum 9 characters
                </div>
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={8}>
            <Button 
              type="primary" 
              icon={<FileSearchOutlined />}
              onClick={fetchBorrowRecords}
              style={{ marginRight: 8 }}
            >
              Search
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={() => {
                setRecordsParams({
                  ...recordsParams,
                  borrowDateAfter: null,
                  returned: false,
                  targetCNA: null
                });
                setTempCNAValue('');
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
        
        <Table 
          dataSource={borrowRecords} 
          columns={columns}
          rowKey="id"
          loading={recordsLoading}
          pagination={{
            current: recordsParams.page,
            pageSize: recordsParams.pageSize,
            onChange: (page) => setRecordsParams({ ...recordsParams, page }),
            total: 100, // Mock total
          }}
        />
      </div>
    );
  };
  
  return (
    <div 
      className="borrow-container" 
      ref={containerRef} 
      tabIndex={0} 
      onFocus={handleFocus}
      style={{ outline: 'none' }}
    >
      <Card>
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane 
            tab={<span><ScanOutlined /> Borrow</span>} 
            key="1"
          >
            <BorrowTabContent />
          </TabPane>
          
          <TabPane 
            tab={<span><BookOutlined /> Reserve</span>} 
            key="2"
          >
            <ReserveTabContent />
          </TabPane>
          
          <TabPane 
            tab={<span><HistoryOutlined /> Borrow Records</span>} 
            key="3"
          >
            <BorrowRecordsTabContent />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};


export default Borrow;