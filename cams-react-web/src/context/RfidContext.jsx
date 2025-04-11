import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { message, notification } from 'antd';

// Create the context
const RfidContext = createContext();

// Get electron IPC if we're in the desktop app
const electron = window.require && window.require('electron');
const ipcRenderer = electron?.ipcRenderer;
const inBrowser = !ipcRenderer;

// Provider component
export const RfidProvider = ({ children }) => {
  // Initialize state
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]); 
  const [lastScannedTag, setLastScannedTag] = useState(null);
  const [logRef, setLogRef] = useState({ current: null });
  const [isResetting, setIsResetting] = useState(false); // Flag to prevent reconnection loops
  const [allowAutoScan, setAllowAutoScan] = useState(false); // Flag to prevent automatic scanning - default OFF
  
  // Event listeners for RFID operations
  useEffect(() => {
    if (inBrowser) return;
    
    // Get available devices
    const handleDeviceList = (event, devices) => {
      try {
        const parsedDevices = JSON.parse(devices).devices;
        const deviceOptions = parsedDevices.map((device, index) => ({
          value: index.toString(),
          label: device,
        }));
        setAvailableDevices(deviceOptions);
      } catch (error) {
        console.error('Error parsing devices list:', error);
      }
    };

    // Handle scan results
    const handleNewTag = (event, message) => {
      if (logRef.current) {
        logRef.current.innerHTML += `<span style="color:red;">newScannedTag</span>: ${message}<br>`;
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
      
      try {
        const tagObj = JSON.parse(message);
        if (tagObj && tagObj.TID) {
          console.log('RFID TID scanned:', tagObj.TID);
          setLastScannedTag(tagObj);
        }
      } catch (error) {
        console.error('Error parsing RFID tag data:', error);
      }
    };
    
    // Handle connection states
    const handleConnect = (event, data) => {
      logEvent('replyConnectUsbRfidReader', data);
      try {
        const response = JSON.parse(data);
        if (response.success === true) {
          setIsConnected(true);
          message.success('RFID reader connected successfully');
          
          // Manual control: Only notify about successful connection, don't auto-restart scanning
          if (isResetting) {
            console.log('Connection successful after reset');
            message.success('RFID reader reconnected successfully. Click Execute to scan.');
          }
        } else {
          // Special handling for already connected case
          if (response.error && response.error.includes('already connected')) {
            setIsConnected(true); // Set connected state to true since device is actually connected
            message.info('RFID reader is already connected');
            
            // Manual control: Only notify about connection status, don't auto-restart scanning
            if (isResetting) {
              console.log('Device already connected during reset');
              message.success('RFID reader is ready. Click Execute to scan.');
            }
          } else {
            setIsConnected(false);
            let errorMsg = 'Failed to connect to RFID reader';
            if (response.error && typeof response.error === 'string') {
              errorMsg += `: ${response.error}`;
            }
            message.error(errorMsg);
          }
        }
      } catch (e) {
        console.error('Error processing connection response:', e);
        message.error('Error processing RFID reader response');
      }
    };
    
    // Handle start scan
    const handleStartScan = (event, data) => {
      console.log('RFID scan response received');
      logEvent('replyStartLoopRead', data);
      try {
        const response = JSON.parse(data);
        if (response.success === true) {
          setIsScanning(true);
          message.success('RFID scanning started');
        } else {
          // Special handling for common GetEPC_TID_UserData errors
          if (response.error && response.error.includes('GetEPC_TID_UserData failed: -2')) {
            // This is a hardware-level error that requires a full USB disconnect/reconnect
            console.log('Hardware error detected: GetEPC_TID_UserData failed: -2');
            message.error('RFID reader hardware error detected');
            
            // Mark as not connected since the device is in an error state
            setIsConnected(false);
            setIsScanning(false);
            
            // Show specific instructions to help the user
            notification.warning({
              message: 'RFID Reader Needs Reset',
              description: (
                <div>
                  <p>Please follow these steps to reset your RFID reader:</p>
                  <ol>
                    <li>Physically unplug the RFID reader from the USB port</li>
                    <li>Wait 5 seconds</li>
                    <li>Plug the reader back in</li>
                    <li>Click "Connect" and then "Execute"</li>
                  </ol>
                </div>
              ),
              duration: 0 // Don't auto-dismiss
            });
          } else if (response.error && response.error.includes('Index was out of range')) {
            // Handle the index out of range error
            setIsScanning(false);
            if (!isResetting) {
              message.warning('RFID reader connection issue. Please check status.');
            }
          } else {
            setIsScanning(false);
            let errorMsg = 'Failed to start RFID scanning';
            if (response.error && typeof response.error === 'string') {
              errorMsg += `: ${response.error}`;
            }
            message.error(errorMsg);
          }
        }
      } catch (e) {
        message.error('Error processing RFID scanner response');
      }
    };
    
    // Handle stop scan
    const handleStopScan = (event, data) => {
      logEvent('replyStopLoopRead', data);
      try {
        const response = JSON.parse(data);
        if (response.success === true) {
          setIsScanning(false);
          message.success('RFID scanning stopped');
        } else {
          let errorMsg = 'Failed to stop RFID scanning';
          if (response.error && typeof response.error === 'string') {
            errorMsg += `: ${response.error}`;
          }
          message.error(errorMsg);
        }
      } catch (e) {
        message.error('Error processing RFID scanner response');
      }
    };
    
    // Handle disconnect
    const handleDisconnect = (event, data) => {
      logEvent('replyDisconnectUsbRfidReader', data);
      try {
        const response = JSON.parse(data);
        if (response.success === true) {
          setIsConnected(false);
          setIsScanning(false);
          message.success('RFID reader disconnected');
        } else {
          // Special handling for empty device list
          if (response.error && response.error.includes('ConnectedDeviceList is empty')) {
            // Device is already disconnected, just update state silently
            setIsConnected(false);
            setIsScanning(false);
          } else {
            let errorMsg = 'Failed to disconnect from RFID reader';
            if (response.error && typeof response.error === 'string') {
              errorMsg += `: ${response.error}`;
            }
            message.error(errorMsg);
          }
        }
      } catch (e) {
        message.error('Error processing RFID reader response');
      }
    };
    
    // Flag to track if we've recently shown a status message
    let statusMessageShown = false;

    // Handle connection status check
    const handleCheckConnectionStatus = (event, data) => {
      logEvent('replyCheckConnectionStatus', data);
      
      try {
        const response = JSON.parse(data);
        const wasConnected = isConnected; // Store previous state
        
        if (response.isConnected === true) {
          setIsConnected(true);
          
          // Only show message if not suppressing or if connection state changed
          if (!statusMessageShown || !wasConnected) {
            message.success('RFID reader is connected');
          }
        } else {
          setIsConnected(false);
          
          // Only show message if not suppressing or if connection state changed
          if (!statusMessageShown || wasConnected) {
            message.info('RFID reader is not connected');
          }
        }
        
        // Set flag to prevent duplicate messages only for UI notifications
        if (!statusMessageShown) {
          statusMessageShown = true;
          setTimeout(() => {
            statusMessageShown = false;
          }, 1000);
        }
      } catch (e) {
        console.error('Error checking connection status:', e);
        message.error('Error checking connection status');
      }
    };

    // First, make sure to remove any existing listeners to avoid duplicates
    ipcRenderer.removeAllListeners("replyConnectUsbRfidReader");
    ipcRenderer.removeAllListeners("replyStartLoopRead");
    ipcRenderer.removeAllListeners("replyStopLoopRead");
    ipcRenderer.removeAllListeners("replyDisconnectUsbRfidReader");
    ipcRenderer.removeAllListeners("replyCheckConnectionStatus");
    ["replySingleRead", "scanningOver", "replyGetRfidReaderInformation"].forEach(eventName => {
      ipcRenderer.removeAllListeners(eventName);
    });

    // Register all listeners
    ipcRenderer.on("replyGetUsbDeviceList", handleDeviceList);
    ipcRenderer.on("newScannedTag", handleNewTag);
    ipcRenderer.on("replyConnectUsbRfidReader", handleConnect);
    ipcRenderer.on("replyStartLoopRead", handleStartScan);
    ipcRenderer.on("replyStopLoopRead", handleStopScan);
    ipcRenderer.on("replyDisconnectUsbRfidReader", handleDisconnect);
    ipcRenderer.on("replyCheckConnectionStatus", handleCheckConnectionStatus);
    
    // Log other events
    ["replySingleRead", "scanningOver", "replyGetRfidReaderInformation"].forEach(eventName => {
      ipcRenderer.on(eventName, (event, data) => {
        logEvent(eventName, data);
      });
    });
    
    // Helper for logging events
    const logEvent = (eventName, data) => {
      if (logRef.current) {
        logRef.current.innerHTML += `<span style="color:red;">${eventName}</span>: ${data}<br>`;
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    };
    
    // Initialize device list
    ipcRenderer.send("getUsbDeviceList");
    
    // Cleanup function
    return () => {
      ipcRenderer.removeAllListeners("replyGetUsbDeviceList");
      ipcRenderer.removeAllListeners("newScannedTag");
      ipcRenderer.removeAllListeners("replyConnectUsbRfidReader");
      ipcRenderer.removeAllListeners("replyStartLoopRead");
      ipcRenderer.removeAllListeners("replyStopLoopRead");
      ipcRenderer.removeAllListeners("replyDisconnectUsbRfidReader");
      ipcRenderer.removeAllListeners("replySingleRead");
      ipcRenderer.removeAllListeners("scanningOver");
      ipcRenderer.removeAllListeners("replyGetRfidReaderInformation");
    };
  }, []);
  
  // Function to connect RFID reader - completely rewritten
  const connectReader = () => {
    if (inBrowser) {
      message.error('RFID functionality is only available in the desktop application');
      return;
    }
    
    // First, ensure any existing connection is properly closed
    console.log('Disconnecting any existing connection...');
    ipcRenderer.send("disconnectUsbRfidReader", 0);
    
    // Clear states immediately to prevent UI confusion
    setIsConnected(false);
    setIsScanning(false);
    setIsResetting(false);
    
    // Wait for disconnect to complete before attempting to connect
    setTimeout(() => {
      console.log('Attempting to connect RFID reader...');
      message.loading({ content: 'Connecting to RFID reader...', key: 'rfidOperation' });
      ipcRenderer.send("connectUsbRfidReader", 0);
      
      if (logRef.current) {
        logRef.current.innerHTML += '<span style="color:red;">connectBtn</span>: Connecting...<br>';
      }
    }, 1000);
  };
  
  // Function to check connection status
  const checkConnectionStatus = () => {
    if (inBrowser) {
      message.error('RFID functionality is only available in the desktop application');
      return;
    }
    
    // Prevent multiple calls using a global flag
    if (window._checkingStatus) {
      console.log('Status check already in progress');
      return;
    }
    
    // Set global flag
    window._checkingStatus = true;
    
    // Display loading message
    message.loading({ content: 'Checking RFID connection...', key: 'rfidOperation' });
    
    // Send the status check
    ipcRenderer.send("checkConnectionStatus", 0);
    
    // Reset the flag after a delay
    setTimeout(() => {
      window._checkingStatus = false;
    }, 1000);
  };

  // Function to start scanning - completely rewritten for reliability
  const startScanning = () => {
    // Debug info
    console.log('Manual scan requested');
    
    if (inBrowser) {
      message.error('RFID functionality is only available in the desktop application');
      return;
    }
    
    // If already scanning, don't start again
    if (isScanning) {
      message.info('RFID scanning already in progress');
      return;
    }
    
    // If not connected, handle that first
    if (!isConnected) {
      message.info('Please connect the RFID reader first');
      return;
    }
    
    // Start the scan - only when explicitly requested by user
    console.log('Starting RFID scan...');
    message.loading({ content: 'Starting RFID scan...', key: 'rfidOperation' });
    ipcRenderer.send("startLoopRead", 0);
  };
  
  // Function to stop scanning
  const stopScanning = () => {
    if (inBrowser) return;
    
    if (!isScanning) {
      message.info('RFID scanning not in progress');
      return;
    }
    
    message.loading({ content: 'Stopping RFID scan...', key: 'rfidOperation' });
    ipcRenderer.send("stopLoopRead", 0);
  };
  
  // Function to disconnect reader
  const disconnectReader = () => {
    if (inBrowser) return;
    
    if (!isConnected) {
      message.info('RFID reader not connected');
      return;
    }
    
    // Stop scanning if in progress
    if (isScanning) {
      ipcRenderer.send("stopLoopRead", 0);
    }
    
    message.loading({ content: 'Disconnecting RFID reader...', key: 'rfidOperation' });
    ipcRenderer.send("disconnectUsbRfidReader", 0);
    
    if (logRef.current) {
      logRef.current.innerHTML += '<span style="color:red;">Disconnected</span>: 1<br>';
    }
  };
  
  // Reset the RFID connection
  const resetConnection = () => {
    if (inBrowser) return;
    
    // Prevent multiple resets
    if (isResetting) {
      console.log('Reset already in progress, ignoring request');
      return;
    }
    
    console.log('Manual reset initiated');
    setIsResetting(true);
    message.loading({ content: 'Resetting RFID connection...', key: 'rfidOperation' });
    
    // First stop scanning if active
    if (isScanning) {
      console.log('Stopping scan as part of reset');
      ipcRenderer.send("stopLoopRead", 0);
    }
    
    // Then disconnect
    console.log('Disconnecting reader as part of reset');
    ipcRenderer.send("disconnectUsbRfidReader", 0);
    
    // Reset state
    setIsConnected(false);
    setIsScanning(false);
    setLastScannedTag(null);
    
    // Wait a moment before reconnecting
    setTimeout(() => {
      console.log('Reconnecting after reset');
      message.loading({ content: 'Reconnecting...', key: 'rfidOperation' });
      ipcRenderer.send("connectUsbRfidReader", 0);
      
      // Reset the reset flag after some time
      setTimeout(() => {
        console.log('Reset sequence complete, clearing reset flag');
        setIsResetting(false);
      }, 3000);
    }, 2000);
    
    if (logRef.current) {
      logRef.current.innerHTML += '<span style="color:red;">resetConnection</span>: Resetting connection...<br>';
    }
  };
  
  // Clear log and last scanned tag
  const clearData = () => {
    if (logRef.current) {
      logRef.current.innerHTML = '';
    }
    setLastScannedTag(null);
    message.success('Cleared RFID data');
  };
  
  // Set the log reference from components
  const setLogReference = (ref) => {
    logRef.current = ref;
  };
  
  // Context value
  const value = {
    isConnected,
    isScanning,
    availableDevices,
    lastScannedTag,
    logRef,
    isResetting,
    
    // Methods
    connectReader,
    startScanning,
    stopScanning,
    disconnectReader,
    clearData,
    resetConnection,
    checkConnectionStatus,
    setLogReference,
    
    // Flags
    inBrowser
  };
  
  return (
    <RfidContext.Provider value={value}>
      {children}
    </RfidContext.Provider>
  );
};

// Custom hook to use the RFID context
export const useRfid = () => {
  const context = useContext(RfidContext);
  if (!context) {
    throw new Error('useRfid must be used within an RfidProvider');
  }
  return context;
};

export default RfidContext;
