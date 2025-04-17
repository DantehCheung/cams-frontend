
import React from "react";
import { Tabs } from "antd";
import AddUser from "./addUser";
import BindUserCard from "./bindUserCard"; // a new component

const ManageUsers = () => {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Add User" key="1">
        <AddUser />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Link CNA ↔ SID" key="2">
        <BindUserCard />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default ManageUsers;