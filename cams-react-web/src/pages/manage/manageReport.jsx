import React,{useState} from "react";
import { Tabs } from "antd";
import DeviceBorrowReport from "./sub-report/deviceborrow";
import OverdueDeviceReport from "./sub-report/overdue";
import DeviceStatusReport from "./sub-report/devicestatus";

const ManageReport = () => {

    const [activeKey, setActiveKey] = useState("1");
  
    const handleTabChange = (key) => {
      setActiveKey(key);
    };
  
  
    // define items array replace Tabs.TabPane component
    const items = [
      {
        key: "1",
        label: "Device Borrow History",  // use label replace tab
        children: <DeviceBorrowReport key={`add-user-${activeKey === "1"}`} />
      },
      {
        key: "2",
        label: "Overdue Device List",
        children: <OverdueDeviceReport key={`add-user-${activeKey === "2"}`} />
      },
      {
        key: "3",
        label: "Device Status",
        children: <DeviceStatusReport key={`add-user-${activeKey === "3"}`} />
      },
    ];
  
    return (
      <div className="managereport-container">
        <Tabs onChange={handleTabChange} activeKey={activeKey} items={items} />
      </div>
    );
  };
  
  export default ManageReport;