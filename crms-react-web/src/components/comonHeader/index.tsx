import React from "react";

import { Button, Layout, Avatar, Dropdown, MenuProps } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";

import catImg from "../../assets/images/cat.png";
import "./index.css";
import { collapseMenu } from "../../store/reducers/tab";
import { useDispatch } from "react-redux";

const { Header } = Layout;
//if want to keep relationship with event or state, const put inside function

const CommonHeader = ({ collapsed }) => {
  const logout = () => {};
  // define dispatch
  const dispatch = useDispatch();

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a target="_blank" rel="noopener noreferrer" href="#">
          User Center
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a
          onClick={() => logout}
          target="_blank"
          rel="noopener noreferrer"
          href="#"
        >
          Logout
        </a>
      ),
    },
  ];

  const setCollapsed = () => {
    console.log(collapsed);
    dispatch(collapseMenu());
  };
  return (
    <Header className="header-container">
      <Button
        type="text"
        icon={<MenuFoldOutlined />}
        style={{
          fontSize: "16px",
          width: 64,
          height: 32,
          backgroundColor: "white",
        }}
        onClick={() => setCollapsed()}
      />
      <Dropdown menu={{ items }}>
        <Avatar size={36} src={<img src={catImg} />} />
      </Dropdown>
    </Header>
  );
};

export default CommonHeader;
