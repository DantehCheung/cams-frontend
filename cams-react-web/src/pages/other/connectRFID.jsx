import React, { useState, useEffect, useRef } from "react";
import { Typography, Button, Divider, Form, Row, Col, Card, Alert, Space } from "antd";
import { ReloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRfid } from "../../context/RfidContext";

const { Title, Text } = Typography;

const ConnectRFID = () => {
  // Use the global RFID context
  const {
    isConnected,
    isScanning,
    availableDevices,
    lastScannedTag,
    connectReader,
    startScanning,
    stopScanning,
    disconnectReader,
    clearData,
    resetConnection,
    checkConnectionStatus,
    setLogReference,
    inBrowser,  
    // Add this to your context if not already there
    connectedDevice
  } = useRfid();

  const outputRef = useRef(null);

  // Setup the output reference for logging
  useEffect(() => {
    if (outputRef.current) {
      setLogReference(outputRef.current);
    }
  }, [outputRef, setLogReference]);

  // Display scanned tag details if available
  const getTagDisplay = () => {
    // Your existing code for tag display
  };

  return (
    <>
      <div style={{ padding: 16 }}>
        <Card>
          <Title level={2}>RFID Reader Connection</Title>
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item label="Available Devices">
                <div className="rfid-status-box" style={{
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                backgroundColor: availableDevices ? '#f6ffed' : '#f5f5f5',
                borderColor: availableDevices ? '#b7eb8f' : '#d9d9d9',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px'
              }}>
                    {availableDevices.length > 0 ? (
                  
                     
                      availableDevices.map((device, index) => (
                       
                        <div  key={index}>
                          
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px', marginRight: '8px' }} />
                          {device.label || device.value || JSON.stringify(device)}</div>
                   
                      ))
                    ) : (
                      <Text type="danger">No devices found</Text>
                    )}
                  </div>
                </Form.Item>

                <Form.Item label="Device Status">
                  {isConnected ? (
                    <Alert
                      message={`Connected: ${connectedDevice || "RFID Reader"}`}
                      type="success"
                      showIcon
                    />
                  ) : (
                    <Alert
                      message="Not Connected"
                      description="Click 'Connect' to establish a connection with the RFID reader."
                      type="info"
                      showIcon
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Space>
                  <Button
                    type="primary"
                    onClick={startScanning}
                    disabled={inBrowser || !isConnected || isScanning}
                  >
                    Execute
                  </Button>
                  <Button
                    type="primary"
                    onClick={stopScanning}
                    danger
                    disabled={inBrowser || !isScanning}
                  >
                    Stop
                  </Button>
                  <Button onClick={clearData}>
                    Clear
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={checkConnectionStatus}
                    disabled={inBrowser}
                  >
                    Check Status
                  </Button>
                </Space>

                <div style={{ float: "right" }}>
                  <Button
                    type="primary"
                    onClick={connectReader}
                    disabled={inBrowser || isConnected}
                  >
                    Connect
                  </Button>
                  <Button
                    type="primary"
                    onClick={disconnectReader}
                    danger
                    style={{ marginLeft: 10 }}
                    disabled={inBrowser || !isConnected}
                  >
                    Disconnect
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider />

        {/* Rest of your component */}
      </div>
    </>
  );
};

export default ConnectRFID;