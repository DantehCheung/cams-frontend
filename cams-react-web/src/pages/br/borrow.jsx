import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Input, Button, notification, Select, Row, Col, Spin, Typography, Divider } from "antd";
import { ScanOutlined, ClearOutlined, CheckCircleOutlined } from '@ant-design/icons';
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
      if (!rfidValue) {
        notification.error({
          message: "Borrowing Failed",
          description: "Please scan an RFID tag first.",
        });
        return;
      }
      
      setLoading(true);
      
      // Here you would make your actual API call
      // For example:
      // const result = await assetService.borrowItem({
      //   rfidTag: rfidValue
      // });
      
      // For now, simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update your redux store if needed
      dispatch(borrowSuccess([]));
      
      notification.success({
        message: "Borrowing Completed",
        description: `Item with RFID ${rfidValue} has been borrowed successfully.`,
      });
      
      // Reset the form and RFID value
      borrowForm.resetFields();
      setRfidValue('');
      
    } catch (error) {
      console.error('Error during borrow process:', error);
      notification.error({
        message: "Borrowing Failed",
        description: error.toString(),
      });
    } finally {
      setLoading(false);
    }
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
        <Title level={2} style={{ marginBottom: 24 }}>Borrow Item via RFID</Title>
        
        <Spin spinning={loading}>
          <Form form={borrowForm} layout="vertical">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24}>
                <Form.Item label="RFID Tag Input">
                  <Input
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
            </Row>
            
            {/* Debug panel with improved visibility */}
            <Form.Item label="RFID Debug Panel">
              <div
                ref={rfidOutputRef}
                style={{
                  padding: '8px',
                  backgroundColor: '#f0f2f5',
                  borderRadius: '4px',
                  height: '150px',
                  overflowY: 'auto',
                  marginBottom: '12px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              >
                <p style={{ margin: 0 }}><strong>RFID Debug Info:</strong> Will show events here</p>
              </div>
            </Form.Item>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={8}>
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
              <Col span={8}>
                <Button 
                  type="primary"
                  danger
                  onClick={() => {
                    const testRfid = 'TEST' + Math.floor(Math.random() * 1000000).toString();
                    // Update the log output
                    if (rfidOutputRef.current) {
                      rfidOutputRef.current.innerHTML += `<div style="color: green;">Test RFID generated: ${testRfid}</div>`;
                      rfidOutputRef.current.scrollTop = rfidOutputRef.current.scrollHeight;
                    }
                    // Set the RFID value directly
                    setRfidValue(testRfid);
                  }}
                  style={{ width: '100%', height: '40px' }}
                >
                  Test RFID Scan
                </Button>
              </Col>
              <Col span={8}>
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
                <li>Click "Confirm Borrow" to complete the borrowing process</li>
              </ol>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};


export default Borrow;