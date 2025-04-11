import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Input, Button, notification, Select, Row, Col, Spin, Typography, Divider, Tabs, Table, Space, DatePicker, Descriptions } from "antd";
import { ScanOutlined, ClearOutlined, CheckCircleOutlined, HistoryOutlined, FileSearchOutlined, BookOutlined } from '@ant-design/icons';
import "./borrow.css"; // css file
// insert react redux hooks
import { useSelector, useDispatch } from "react-redux";
import { borrowSuccess } from "../../store/modules/borrowSlice";
import { assetService } from "../../api";

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

  // Set a page identifier when component mounts
  useEffect(() => {
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
  
  // State for Check tab
  const [checkForm] = Form.useForm();
  const [checkRfidValue, setCheckRfidValue] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);
  
  // State for Borrow Record tab
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [recordsParams, setRecordsParams] = useState({
    page: 1,
    pageSize: 10,
    startDate: null,
    endDate: null
  });
  
  // Function to handle tab change
  const handleTabChange = (activeKey) => {
    console.log('Active tab:', activeKey);
    // You could load data based on the active tab here
    if (activeKey === '3') { // Borrow Records tab
      fetchBorrowRecords();
    }
  };
  
  // Mock function to fetch borrow records
  const fetchBorrowRecords = async () => {
    try {
      setRecordsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock data
      const mockRecords = [
        { id: 1, itemName: 'Laptop', rfidTag: 'E280110640000252B96AAD01', borrowDate: '2025-04-09', returnDate: '2025-04-16', status: 'Active' },
        { id: 2, itemName: 'Projector', rfidTag: 'E280110640000252B96AAD02', borrowDate: '2025-04-08', returnDate: '2025-04-15', status: 'Active' },
        { id: 3, itemName: 'Tablet', rfidTag: 'E280110640000252B96AAD03', borrowDate: '2025-04-05', returnDate: '2025-04-12', status: 'Returned' }
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
  
  // Mock function to check item details
  const handleCheckItem = async () => {
    if (!checkRfidValue) {
      notification.warning({
        message: 'No RFID Value',
        description: 'Please scan an RFID tag first'
      });
      return;
    }
    
    try {
      setCheckLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock data
      setItemDetails({
        id: 123,
        name: 'Demo Item',
        category: 'Electronic',
        rfidTag: checkRfidValue,
        status: 'Available',
        location: 'Main Storage',
        lastBorrowed: '2025-04-01'
      });
    } catch (error) {
      console.error('Error checking item:', error);
      notification.error({
        message: 'Item Check Failed',
        description: error.toString()
      });
    } finally {
      setCheckLoading(false);
    }
  };
  
  // Mock function for reservation
  const handleReserveItem = async () => {
    try {
      const values = await reserveForm.validateFields();
      setReserveLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notification.success({
        message: 'Reservation Successful',
        description: `You have successfully reserved ${values.itemName} from ${values.startDate} to ${values.endDate}`
      });
      
      reserveForm.resetFields();
    } catch (error) {
      console.error('Reservation error:', error);
      notification.error({
        message: 'Reservation Failed',
        description: error.toString()
      });
    } finally {
      setReserveLoading(false);
    }
  };
  
  // Get current date and add 30 days for max date limit
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  // Disable dates before today and after 30 days from now
  const disabledDate = (current) => {
    return current && (current < today || current > thirtyDaysLater);
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
                disabledDate={disabledDate}
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
              name="itemName" 
              label="Item Name" 
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <Select placeholder="Select an item to reserve">
                <Select.Option value="laptop">Laptop</Select.Option>
                <Select.Option value="projector">Projector</Select.Option>
                <Select.Option value="camera">Camera</Select.Option>
                <Select.Option value="microphone">Microphone</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please select a location' }]}
            >
              <Select placeholder="Select pickup location">
                <Select.Option value="mainLibrary">Main Library</Select.Option>
                <Select.Option value="scienceLab">Science Lab</Select.Option>
                <Select.Option value="mediaCenter">Media Center</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select a start date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select an end date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          
          <Col xs={24}>
            <Form.Item
              name="purpose"
              label="Purpose of Reservation"
            >
              <Input.TextArea rows={4} placeholder="Please describe why you need this item" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row justify="end">
          <Col>
            <Button type="primary" htmlType="submit" icon={<BookOutlined />}>
              Submit Reservation
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
  
  // Check Tab Content
  const CheckTabContent = () => (
    <Spin spinning={checkLoading}>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Form form={checkForm} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item label="RFID Tag" style={{ flex: 1 }}>
              <Input
                value={checkRfidValue}
                onChange={(e) => setCheckRfidValue(e.target.value)}
                placeholder="Scan or enter RFID tag..."
                suffix={
                  checkRfidValue ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : null
                }
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleCheckItem}
                icon={<FileSearchOutlined />}
              >
                Check Item
              </Button>
            </Form.Item>
          </Form>
        </Col>
        
        {itemDetails && (
          <Col xs={24}>
            <Card title="Item Details" bordered={false}>
              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Item Name">{itemDetails.name}</Descriptions.Item>
                <Descriptions.Item label="Category">{itemDetails.category}</Descriptions.Item>
                <Descriptions.Item label="RFID Tag">{itemDetails.rfidTag}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Text 
                    type={itemDetails.status === 'Available' ? 'success' : 'danger'}
                    strong
                  >
                    {itemDetails.status}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Location">{itemDetails.location}</Descriptions.Item>
                <Descriptions.Item label="Last Borrowed">{itemDetails.lastBorrowed}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}
      </Row>
    </Spin>
  );
  
  // Borrow Records Tab Content
  const BorrowRecordsTabContent = () => {
    const columns = [
      {
        title: 'Item Name',
        dataIndex: 'itemName',
        key: 'itemName',
      },
      {
        title: 'RFID Tag',
        dataIndex: 'rfidTag',
        key: 'rfidTag',
      },
      {
        title: 'Borrow Date',
        dataIndex: 'borrowDate',
        key: 'borrowDate',
      },
      {
        title: 'Return Date',
        dataIndex: 'returnDate',
        key: 'returnDate',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Text 
            type={status === 'Active' ? 'warning' : (status === 'Returned' ? 'success' : 'danger')}
            strong
          >
            {status}
          </Text>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space size="middle">
            <Button type="link" size="small">View Details</Button>
            {record.status === 'Active' && (
              <Button type="link" size="small">Return</Button>
            )}
          </Space>
        ),
      },
    ];
    
    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <DatePicker.RangePicker 
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setRecordsParams({
                    ...recordsParams,
                    startDate: dates[0],
                    endDate: dates[1]
                  });
                }
              }}
            />
          </Col>
          <Col xs={24} md={16}>
            <Button 
              type="primary" 
              icon={<FileSearchOutlined />}
              onClick={fetchBorrowRecords}
              style={{ marginRight: 8 }}
            >
              Search
            </Button>
            <Button icon={<ClearOutlined />}>
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
            tab={<span><FileSearchOutlined /> Check</span>} 
            key="3"
          >
            <CheckTabContent />
          </TabPane>
          
          <TabPane 
            tab={<span><HistoryOutlined /> Borrow Records</span>} 
            key="4"
          >
            <BorrowRecordsTabContent />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};


export default Borrow;