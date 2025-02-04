import React, { useState, useEffect } from "react";
import { Typography, Select, Button, Divider, Form, Row, Col, Card, message } from "antd";
import RFID from "../../components/commonRFID/RFID";
const { ipcRenderer } = window.require("electron");
let isLoad = false;

const { Title } = Typography;

const ConnectRFID = () => {
  const [data, setData] = useState("Item1");
  const [availableDevices, setAvailableDevices] = useState([]);

  const showDebugMsg = (e) => {
    ipcRenderer.on(e, (event, message) => {
      document.getElementById("output").innerHTML += `<span style="color:red;">${e}</span>: ${message}<br>`;
    });
  };

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
    showDebugMsg("replyDisconnectUsbRfidReader");
  };

  const populateAvailableDevices = (j) => {
    let devices = JSON.parse(j).devices;
    const deviceOptions = devices.map((device, index) => ({
      value: index.toString(),
      label: device,
    }));
    setAvailableDevices(deviceOptions);
  };

  useEffect(() => {
    if (isLoad) {
      return;
    }
    isLoad = true;
    addIpcRendererOn();
    ipcRenderer.send("getUsbDeviceList");

    document.getElementById("clear").addEventListener("click", () => {
      document.getElementById("output").innerHTML = "";
    });

    document.getElementById("connectBtn").addEventListener("click", () => {
      document.getElementById("output").innerHTML += `<span style="color:red;">"connectBtn"</span>: 1<br>`;
      ipcRenderer.send("connectUsbRfidReader", 0);
    });

    document.getElementById("execute").addEventListener("click", () => {
      ipcRenderer.send("startLoopRead", 0);
    });

    document.getElementById("stop").addEventListener("click", () => {
      ipcRenderer.send("stopLoopRead", 0);
    });

    document.getElementById("disconnect").addEventListener("click", () => {
      document.getElementById("output").innerHTML += `<span style="color:red;">"Disconnected"</span>: 1<br>`;
      ipcRenderer.send("disconnectUsbRfidReader", 0);
    });
  }, []);

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
                    id="connectType"
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="SELECT"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={[{ value: "USB", label: "USB" }]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Available Device">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Select
                      id="availableDevice"
                      showSearch
                      style={{ flex: 1 }}
                      placeholder="Search to Select"
                      optionFilterProp="label"
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
                      }
                      options={availableDevices}
                    />
                   
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Button type="primary" id="execute">
                  Execute
                </Button>
                <Button type="primary" id="stop" style={{ marginLeft: 10 }} danger>
                      Stop
                    </Button>
                <Button style={{ marginLeft: 10 }} id="clear">
                  Clear
                </Button>
              <div style={{ float: "right" }}>
                <Button type="primary" id="connectBtn" style={{ marginLeft: 10 }}>
                      Connect
                    </Button>
                    <Button id="disconnect" type="primary" danger style={{ marginLeft: 10 }}>Disconnect</Button>
                    </div>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider />

        <Card title="Result">
          <div id="output" style={{ overflow: "hidden" }}></div>
        </Card>
      </div>
     
    </>
  );
};

export default ConnectRFID;