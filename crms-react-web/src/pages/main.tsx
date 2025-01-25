import React from "react";
import { Outlet } from "react-router-dom"; // for children class exit
// the children route content will put into outlet component
// import { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import CommonAsider from "../components/commonAside";
import CommonHeader from "../components/comonHeader";
import { useSelector } from "react-redux"; // to get State
import AddUser from "./manage/addUser";

const { Header, Sider, Content } = Layout;

const Main: React.FC = () => {
  //  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // extract collapse open close state
  const collapsed = useSelector((state) => state.tab.isCollapse);

  // <Outlet/> is the most important from react-router-rom, it let the content of component showup
  // main.tsx need to have outlet
  return (
    <Layout className="main-container">
      <CommonAsider collapsed={collapsed} />
      <Layout>
        <CommonHeader collapsed={collapsed} />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
