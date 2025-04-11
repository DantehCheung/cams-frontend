import React, { useEffect, useRef } from "react";
import { Card, Select, Button, Divider, Typography, Space } from "antd";
import { useRfid } from "../../context/RfidContext";

const { Title, Text } = Typography;
const { Option } = Select;

const RFID = ({ onTagScanned }) => {
  // Use the RFID context instead of direct IPC calls
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

  // Call the onTagScanned prop when a new tag is scanned
  useEffect(() => {
    if (lastScannedTag && onTagScanned) {
      onTagScanned(lastScannedTag);
    }
  }, [lastScannedTag, onTagScanned]);

  return (
    <Card>
      <Title level={4}>RFID Reader Control</Title>
      <Divider />
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Connection Type:</Text>
          <Select
            style={{ width: 200, marginLeft: 8 }}
            defaultValue="USB"
            disabled={inBrowser || isConnected}
          >
            <Option value="USB">USB</Option>
          </Select>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>Available Devices:</Text>
          <Select
            style={{ width: 200, marginLeft: 8 }}
            placeholder="Select a device"
            disabled={inBrowser || isConnected}
          >
            {availableDevices.map(device => (
              <Option key={device.value} value={device.value}>{device.label}</Option>
            ))}
          </Select>
        </div>
        
        <Space>
          <Button
            type="primary"
            onClick={connectReader}
            disabled={inBrowser || isConnected}
          >
            Connect
          </Button>
          
          <Button
            type="primary"
            onClick={startScanning}
            disabled={inBrowser || !isConnected || isScanning}
          >
            Start Scanning
          </Button>
          
          <Button
            danger
            onClick={stopScanning}
            disabled={inBrowser || !isScanning}
          >
            Stop Scanning
          </Button>
          
          <Button
            onClick={clearData}
          >
            Clear Log
          </Button>
          
          <Button
            onClick={resetConnection}
            disabled={inBrowser}
          >
            Reset Connection
          </Button>
          
          <Button
            danger
            onClick={disconnectReader}
            disabled={inBrowser || !isConnected}
          >
            Disconnect
          </Button>
        </Space>
      </Space>
      
      <Divider />
      
      <div>
        <Text strong>Status: </Text>
        <Text>{isConnected ? "Connected" : "Disconnected"} | {isScanning ? "Scanning" : "Not Scanning"}</Text>
      </div>
      
      {lastScannedTag && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Last Scanned Tag: </Text>
          <Text>TID: {lastScannedTag.TID || 'N/A'}</Text>
        </div>
      )}
      
      <div 
        ref={outputRef} 
        style={{ 
          marginTop: 16, 
          padding: 8, 
          height: 200, 
          overflow: 'auto', 
          border: '1px solid #d9d9d9', 
          borderRadius: 4 
        }}
      />
    </Card>
  );
};

export default RFID;
