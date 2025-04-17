import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Input, Button, notification, Select, Row, Col, Spin, Typography, Divider, Tabs, Table, Space, DatePicker, Descriptions, Checkbox } from "antd";
const { Text } = Typography;
import "./return.css";
import { ScanOutlined, ClearOutlined, CheckCircleOutlined, HistoryOutlined, FileSearchOutlined, BookOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { checkSuccess } from "../../store/modules/checkSlice";
import { assetService } from "../../api";


// Get Electron IPC 
let electron;

try {
  electron = window.require && window.require('electron');
} catch (e) {
  console.log("Running in browser environment, not Electron.");
}

const ipcRenderer = electron?.ipcRenderer;
const inBrowser = !ipcRenderer;


const Check = () => {

  const columns = [
    { title: "RFID Tag", dataIndex: "rfid", key: "rfid" },
  ];

  const [checkForm] = Form.useForm();
  const [rfidValue, setRfidValue] = useState('');
  const [pendingChecked, setPendingChecked] = useState(true);
  const rfidOutputRef = useRef(null);
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.check); // State get return tag get reducer

  // Set a page identifier when component mounts (for RFID system)
  useEffect(() => {

    dispatch(checkSuccess([])); // Clear the items in the Redux store
    setPendingChecked(true); // Reset pending state


    if (window.ARSInterface && typeof window.ARSInterface.setActivePage === 'function') {
      window.ARSInterface.setActivePage('check');
      console.log('Set active page to: check');
    } else {
      window.activeRFIDPage = 'check';
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
    dispatch(checkSuccess([])); // Clear the items in the Redux store
    setPendingChecked(true); // Reset pending state
    console.log('RFID data cleared');
  };


  const handleAddItem = () => {
    if (!rfidValue) {
      notification.error({
        message: "No RFID Detected",
        description: "Please scan an RFID tag before adding.",
      });
      return;
    }
    // Check for duplicates
    if (items.some(item => item.rfid === rfidValue)) {
      notification.warning({
        message: "Duplicate RFID",
        description: "This RFID tag is already in the list.",
      });
      return;
    }
    // Add the RFID value to the items list
    dispatch(checkSuccess([...items, { key: Date.now(), rfid: rfidValue }]));
    setPendingChecked(false); // Reset pending state
    setRfidValue(""); // Clear for next scan

  };

  //--------------------------------------------------------------------------------------------
  const handleCheck = async () => {
    try {
      const RFIDList = items.map((item) => item.rfid);
      const result = await assetService.checkReturn({ rfidlist: RFIDList });

      if (result && Array.isArray(result.checkedDevice) && result.checkedDevice.length > 0) {

        let checkedDevicesIDs = [];
        result.checkedDevice.forEach((device) => {
          if (device.partsChecked === true) {
            checkedDevicesIDs.push(device.deviceID);
          }
        })

        notification.success({
          message: "Checked Devices",
          description: `Checked ${checkedDevicesIDs.length} device(s).
        Including deviceID ${checkedDevicesIDs.join(', ')}`
        });


        // Enable Confirm Return button once check is successful.
      } else {
        notification.warning({
          message: "No Devices Checked",
          description: "No devices were found or checked.",
        });
        setReturnList([]);
      }
    } catch (error) {
      notification.error({
        message: "Check Failed",
        description: error?.message || error.toString(),
      });

    } finally {
      setPendingChecked(true);
      dispatch(checkSuccess([])); // Clear the items after checking
      setRfidValue(''); // Clear RFID value after checking
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




  return (


    <div className="check-container" ref={containerRef} tabIndex={0} onFocus={handleFocus}>
      <Card title="Check Items (Scan RFID or Add Manually)">

        <Form form={checkForm} layout="vertical">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
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
            <Col xs={24} sm={8} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button icon={<ClearOutlined />} onClick={clearData} type="default" block>
                Clear RFID
              </Button>
              <Button type="primary" onClick={handleAddItem} block>
                Add to List
              </Button>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={items}
          pagination={false}
          style={{ marginTop: 16 }}
        />

        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleCheck}
          style={{ marginTop: 16 }}
          disabled={pendingChecked}
        >
          Check Return
        </Button>

      </Card>
    </div>
  );

}

export default Check;