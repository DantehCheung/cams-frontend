import React from "react";

import { Button, Layout, Avatar, Dropdown } from "antd";
import { MenuFoldOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import catImg from "../../assets/images/cat.png";
import "./index.css";
import { collapseMenu } from "../../store/modules/tabStore";
import { useDispatch } from "react-redux";
const { Header } = Layout;
//if want to keep relationship with event or state, const put inside function



const CommonHeader = ({ collapsed }) => {

  // define dispatch
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const items = [
    { key: "userInfo", label: "Change Password" },
    { key: "login", label: "Logout" },
  ];

  const handleMenuClick = ({ key }) => {

      navigate(`/${key}`);
    
  };

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
      <Dropdown menu={{ items, onClick: handleMenuClick }}>
        <Avatar size={36} src={<img src={catImg} />} />
      </Dropdown>
    </Header>
  );
};

export default CommonHeader;
