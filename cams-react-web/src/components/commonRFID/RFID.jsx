import React, { useEffect, useRef } from "react";
import { Card } from "antd";

const RFID = () => {
  const outputRef = useRef(null);
  const availableDeviceRef = useRef(null);

  // 清除輸出區內容
  const handleClear = () => {
    if (outputRef.current) {
      outputRef.current.innerHTML = "";
    }
  };

  // 將取得的 device 資料轉換並加入下拉選單
  function populateAvailableDevices(jsonString) {
    try {
      let devices = JSON.parse(jsonString).devices;
      if (availableDeviceRef.current) {
        availableDeviceRef.current.innerHTML = ""; // 清除現有選項
        devices.forEach((device, index) => {
          const option = document.createElement("option");
          option.value = index.toString(); // 使用 index 作為值
          option.textContent = device; // 假設 device 為可顯示字串
          availableDeviceRef.current.appendChild(option);
        });
      }
    } catch (error) {
      console.error("failed to parse devices:", error);
    }
  }

  // 設定事件監聽，將收到的訊息顯示在 output 區域
  function showDebugMsg(channel) {
    if (window.electronAPI) {
      window.electronAPI.on(channel, (event, message) => {
        if (outputRef.current) {
          outputRef.current.innerHTML += `<span style="color:red;">${channel}</span>: ${message}<br>`;
        }
      });
    }
  }

  // 設定所有 ipcRenderer 監聽事件
  function addIpcRendererOn() {
    if (window.electronAPI) {
      window.electronAPI.on("replyGetUsbDeviceList", (event, devices) => {
        populateAvailableDevices(devices);
      });
      showDebugMsg("replyConnectUsbRfidReader");
      showDebugMsg("replySingleRead");
      showDebugMsg("newScannedTag");
      showDebugMsg("scanningOver");
      showDebugMsg("replyGetRfidReaderInformation");
      showDebugMsg("replyStartLoopRead");
      showDebugMsg("replyStopLoopRead");
    }
  }

  // 在組件掛載後設定 event listeners 與發送初始訊息
  useEffect(() => {
    addIpcRendererOn();
    if (window.electronAPI) {
      window.electronAPI.send("getUsbDeviceList");
    }
  }, []);

  return (
    <Card>
      <h1>Connect to RFID Reader</h1>
      <br />
      <label>Connection Type:</label>
      <select id="connectType">
        <option value="USB">USB</option>
      </select>
      <br />
      <label>Available Devices:</label>
      <select id="availableDevice" ref={availableDeviceRef} defaultValue="">
        <option value="" disabled>
          Select your RFID device
        </option>
      </select>
      <br />
      <button
        id="connectBtn"
        onClick={() => {
          if (window.electronAPI) {
            // 此處硬碼 0，實際上可從 availableDevice 選項取得選取值
            window.electronAPI.send("connectUsbRfidReader", 0);
          }
        }}
      >
        Connect
      </button>
      <br />
      <button
        id="execute"
        onClick={() => {
          if (window.electronAPI) {
            window.electronAPI.send("startLoopRead", 0);
          }
        }}
      >
        Execute
      </button>
      <button
        id="stop"
        onClick={() => {
          if (window.electronAPI) {
            window.electronAPI.send("stopLoopRead", 0);
          }
        }}
      >
        Stop
      </button>
      <button id="clear" onClick={handleClear}>
        Clear
      </button>
      <br />
      <div id="output" ref={outputRef} style={{ overflow: "hidden" }}></div>
    </Card>
  );
};

export default RFID;