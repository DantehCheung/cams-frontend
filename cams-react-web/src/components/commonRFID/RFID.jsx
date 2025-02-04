import React from "react"
import {Card} from "antd"



document.getElementById("clear")?.addEventListener("click", () => {
    document.getElementById("output").innerHTML = "";
});

const electron_1 = require("electron");
// Function to populate available devices
function populateAvailableDevices(j) {
    let devices = JSON.parse(j).devices;
    const availableDeviceSelect = document.getElementById("availableDevice");
    availableDeviceSelect.innerHTML = ""; // Clear existing options
    devices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = index.toString(); // Using index as the value
        option.textContent = device; // Assuming device has a string representation
        availableDeviceSelect.appendChild(option);
    });
}
function showDegubMsg(e) {
    electron_1.ipcRenderer.on(e, (event, message) => {
        document.getElementById("output").innerHTML += `<span style="color:red;">${e}</span>: ${message}<br>`;
    })
}

function addIpcRendererOn() {
    // 小心不要重覆開event listenner
    electron_1.ipcRenderer.on("replyGetUsbDeviceList", (event, devices) => {
        populateAvailableDevices(devices);
    });

    showDegubMsg("replyConnectUsbRfidReader");
    showDegubMsg("replySingleRead");
    showDegubMsg("newScannedTag");
    showDegubMsg("scanningOver");
    showDegubMsg("replyGetRfidReaderInformation");
    showDegubMsg("replyStartLoopRead");
    showDegubMsg("replyStopLoopRead");

}

window.onload = () => {
    addIpcRendererOn() // 先開好event listenner最安全

    electron_1.ipcRenderer.send("getUsbDeviceList");
    
};
// Connect button event
document.getElementById("connectBtn")?.addEventListener("click", () => {
    // 我在這hardcode 0，實際上應該是從availableDevice取得
    electron_1.ipcRenderer.send("connectUsbRfidReader", 0);
    
});

document.getElementById("execute")?.addEventListener("click", () => {
    // test area
    // GetRfidReaderInformation
    // electron_1.ipcRenderer.send("getRfidReaderInformation",0);
    // electron_1.ipcRenderer.on("replyGetRfidReaderInformation", (event, message) => {
    //     document.getElementById("output").innerHTML += message + "<br>";
    // })

    // read Sigle
    //electron_1.ipcRenderer.send("singleRead", 0);

    // start read loop
    electron_1.ipcRenderer.send("startLoopRead", 0);
});

document.getElementById("stop")?.addEventListener("click", () => {
    electron_1.ipcRenderer.send("stopLoopRead", 0);
});


const RFID = () => {

    
    
   <Card>
   <h1>Connect to RFID Reader</h1>
<br/>
<label for="connectType">Connection Type:</label>
<select id="connectType">
<option value="USB">USB</option>
</select>
<br/>
<label for="availableDevice">Available Devices:</label>
<select id="availableDevice">
<option value="" disabled selected>Select your RFID device</option>

</select>
<button id="connectBtn">Connect</button>
<br/>
<button id="execute">Execute</button>
<button id="stop">Stop</button>
<button id="clear">Clear</button>
<br/>
<div id="output" style="overflow: hidden;"></div>
   </Card>







}

export default RFID;