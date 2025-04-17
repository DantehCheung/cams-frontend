
import React from "react";
import { Tabs } from "antd";
import AddUser from "./addUser";
import BindUserCard from "./bindUserCard"; // a new component
import EditCard from "./editCard"
import "./manageUser.css"; // Assuming you have a CSS file for styles


const ManageUsers = () => {
  // define items array replace Tabs.TabPane component
  const items = [
    {
      key: "1",
      label: "Add User",  // use label replace tab
      children: <AddUser />
    },
    {
      key: "2",
      label: "Link CNA ↔ SID",
      children: <BindUserCard />
    },
    {
      key: "3",
      label: "Edit User Card",
      children: <EditCard/>
    }
  ];

  return (
    <div className="manageuser-container">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default ManageUsers;