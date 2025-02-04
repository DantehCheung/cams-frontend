import React, { useEffect, useRef } from "react";
import { Card } from "antd";

// 若有使用 preload 暴露 API，可從 window.electronAPI 取得，否則請依需求修正
const ipcRenderer = window.electronAPI ? window.electronAPI.ipcRenderer : null;

const RFID = () => {
  const outputRef = useRef(null);
  const availableDeviceRef = useRef(null);

  // 清除輸出區內容
  const handleClear = () => {
    if (outputRef.current) {
      outputRef.current.innerHTML = "";
    }
  };

  // 處理連線按鈕點擊
  const handleConnect = () => {
    if (ipcRenderer) {
      // 此處硬碼 0，實際上應從 availableDevice 取得選取值
      ipcRenderer.send("connectUsbRfidReader", 0);
    }
  };

  // 處理 Execute 按鈕點擊
  const handleExecute = () => {
    if (ipcRenderer) {
      // 例如觸發 startLoopRead 指令
      ipcRenderer.send("startLoopRead", 0);
    }
  };

  // 處理 Stop 按鈕點擊
  const handleStop = () => {
    if (ipcRenderer) {
      ipcRenderer.send("stopLoopRead", 0);
    }
  };

  // 將回傳的訊息內加入到輸出區
  const showDebugMsg = (channel) => {
    if (ipcRenderer) {
      ipcRenderer.on(channel, (event, message) => {
        if (outputRef.current)
          outputRef.current.innerHTML += `<span style="color:red;">${channel}</span>: ${message}<br>`;
      });
    }
  };

  // 將取得到的 available device 資料加入下拉選單
  const populateAvailableDevices = (j) => {
    if (availableDeviceRef.current) {
      let devices = JSON.parse(j).devices;
      // 清除現有選項
      availableDeviceRef.current.innerHTML = "";
      // 新增預設 disabled 選項
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select your RFID device";
      defaultOption.disabled = true;
      availableDeviceRef.current.appendChild(defaultOption);
      // 依據取得的資料新增選項
      devices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = index.toString();
        option.textContent = device;
        availableDeviceRef.current.appendChild(option);
      });
    }
  };

  // 一次性設定 ipcRenderer 的事件監聽
  const addIpcRendererOn = () => {
    if (ipcRenderer) {
      ipcRenderer.on("replyGetUsbDeviceList", (event, devices) => {
        populateAvailableDevices(devices);
      });
      // 註冊其他事件監聽
      showDebugMsg("replyConnectUsbRfidReader");
      showDebugMsg("replySingleRead");
      showDebugMsg("newScannedTag");
      showDebugMsg("scanningOver");
      showDebugMsg("replyGetRfidReaderInformation");
      showDebugMsg("replyStartLoopRead");
      showDebugMsg("replyStopLoopRead");
    }
  };

  useEffect(() => {
    // 組件掛載後，設定 ipcRenderer 監聽，並要求取得 USB 裝置清單
    addIpcRendererOn();
    if (ipcRenderer) {
      ipcRenderer.send("getUsbDeviceList");
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
      <button id="connectBtn" onClick={handleConnect}>
        Connect
      </button>
      <br />
      <button id="execute" onClick={handleExecute}>
        Execute
      </button>
      <button id="stop" onClick={handleStop}>
        Stop
      </button>
      <button id="clear" onClick={handleClear}>
        Clear
      </button>
      <br />
      <div id="output" style={{ overflow: "hidden" }} ref={outputRef}></div>
    </Card>
  );
};

export default RFID;