import React, { useEffect } from "react";
import { Card } from "antd";
const { ipcRenderer } = window.require("electron");

const RFID = () => {
  const addIpcRendererOn = () => {
    ipcRenderer.on("replyGetUsbDeviceList", (event, devices) => {
      populateAvailableDevices(devices);
    });

    showDebugMsg("replyConnectUsbRfidReader");
    showDebugMsg("replySingleRead");
    showDebugMsg("newScannedTag");
    showDebugMsg("scanningOver");
    showDebugMsg("replyGetRfidReaderInformation");
    showDebugMsg("replyStartLoopRead");
    showDebugMsg("replyStopLoopRead");
  };

  const showDebugMsg = (e) => {
    ipcRenderer.on(e, (event, message) => {
      document.getElementById("output").innerHTML += `<span style="color:red;">${e}</span>: ${message}<br>`;
    });
  };

  const populateAvailableDevices = (j) => {
    let devices = JSON.parse(j).devices;
    const availableDeviceSelect = document.getElementById("availableDevice");
    availableDeviceSelect.innerHTML = "";
    devices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = device;
      availableDeviceSelect.appendChild(option);
    });
  };

  useEffect(() => {
    addIpcRendererOn();
    ipcRenderer.send("getUsbDeviceList");

    document.getElementById("clear").addEventListener("click", () => {
      document.getElementById("output").innerHTML = "";
    });

    document.getElementById("connectBtn").addEventListener("click", () => {
      ipcRenderer.send("connectUsbRfidReader", 0);
    });

    document.getElementById("execute").addEventListener("click", () => {
      ipcRenderer.send("startLoopRead", 0);
    });

    document.getElementById("stop").addEventListener("click", () => {
      ipcRenderer.send("stopLoopRead", 0);
    });
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
      <select id="availableDevice" defaultValue="">
        <option value="" disabled>
          Select your RFID device
        </option>
      </select>
      <button id="connectBtn">Connect</button>
      <br />
      <button id="execute">Execute</button>
      <button id="stop">Stop</button>
      <button id="clear">Clear</button>
      <br />
      <div id="output" style={{ overflow: "hidden" }}></div>
    </Card>
  );
};

export default RFID;
