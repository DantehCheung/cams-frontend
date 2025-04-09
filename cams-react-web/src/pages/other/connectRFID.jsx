import React, { useState, useEffect, useRef } from "react";
import { Typography, Select, Button, Divider, Form, Row, Col, Card } from "antd";
import RFID from "../../components/commonRFID/RFID";
import { useRfid } from "../../context/RfidContext";

const { Title } = Typography;

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
    inBrowser
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
    if (!lastScannedTag) return 'No tag scanned';
    
    return (
      <div>
        <p><strong>EPC:</strong> {lastScannedTag.EPC || 'N/A'}</p>
        <p><strong>TID:</strong> {lastScannedTag.TID || 'N/A'}</p>
        <p><strong>Antenna:</strong> {lastScannedTag.Antenna || 'N/A'}</p>
        <p><strong>Protocol:</strong> {lastScannedTag.Protocol || 'N/A'}</p>
        <p><strong>RSSI:</strong> {lastScannedTag.RSSI || 'N/A'}</p>
      </div>
    );
  };

  return (
    <>
      <div style={{ padding: 16 }}>
        <Card>
          <Title level={2}>Connect to RFID Reader</Title>
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Connection Type">
                  <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="SELECT"
                    optionFilterProp="label"
                    defaultValue="USB"
                    options={[{ value: "USB", label: "USB" }]}
                    disabled={inBrowser}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Available Device">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Select
                      showSearch
                      style={{ flex: 1 }}
                      placeholder="Select Device"
                      optionFilterProp="label"
                      options={availableDevices}
                      disabled={inBrowser || isConnected}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
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
                  style={{ marginLeft: 10 }} 
                  danger
                  disabled={inBrowser || !isScanning}
                >
                  Stop
                </Button>
                <Button 
                  style={{ marginLeft: 10 }} 
                  onClick={clearData}
                >
                  Clear
                </Button>
                <Button 
                  type="dashed" 
                  onClick={checkConnectionStatus}
                  style={{ marginLeft: 10 }}
                  disabled={inBrowser}
                >
                  Check Status
                </Button>
                <Button 
                  type="default" 
                  onClick={resetConnection}
                  style={{ marginLeft: 10 }}
                  disabled={inBrowser}
                >
                  Reset Connection
                </Button>
                <div style={{ float: "right" }}>
                  <Button 
                    type="primary" 
                    onClick={connectReader}
                    style={{ marginLeft: 10 }}
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
        
        {lastScannedTag && (
          <Card title="Last Scanned Tag" style={{ marginBottom: 16 }}>
            {getTagDisplay()}
          </Card>
        )}

        <Card title="RFID Reader Output">
          <div ref={outputRef} style={{ minHeight: 200, maxHeight: 400, overflow: "auto" }}></div>
        </Card>
      </div>
    </>
  );
};

export default ConnectRFID;