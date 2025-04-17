
import React,{useState} from "react";
import { Tabs } from "antd";
import AddUser from "./addUser";
import BindUserCard from "./bindUserCard"; // a new component
import EditCard from "./editCard"
import DeleteCard from "./deleteCard"
import "./manageUser.css"; // Assuming you have a CSS file for styles


const ManageUsers = () => {

  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };


  // define items array replace Tabs.TabPane component
  const items = [
    {
      key: "1",
      label: "Add User",  // use label replace tab
      children: <AddUser key={`add-user-${activeKey === "1"}`} />
    },
    {
      key: "2",
      label: "Link CNA ↔ SID",
      children: <BindUserCard key={`add-user-${activeKey === "2"}`} />
    },
    {
      key: "3",
      label: "Edit User Card",
      children: <EditCard key={`add-user-${activeKey === "3"}`} />
    },
    {
      key: "4",
      label: "Delete User Card",
      children: <DeleteCard key={`add-user-${activeKey === "4"}`} />
    }
  ];

  return (
    <div className="manageuser-container">
      <Tabs onChange={handleTabChange} activeKey={activeKey} items={items} />
    </div>
  );
};

export default ManageUsers;