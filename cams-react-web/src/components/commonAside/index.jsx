import React from "react";
import * as Icon from "@ant-design/icons";

import { Layout, Menu } from "antd";
import MainConfig from "../../config";
import { useNavigate } from "react-router-dom";
import camsLogo from "../../assets/images/camslogo.png";

const { Sider } = Layout;




// Safely create icon element
const iconToElement = (name) => {
  const IconComponent = Icon[name];
  if (IconComponent) {
    return React.createElement(IconComponent);
  }
  return null;
};

// Process menu data
const items = MainConfig.map((icon) => {
  const child= {
    key: icon.path,
    icon: icon.icon ? iconToElement(icon.icon) : undefined,
    label: icon.label,
  };

  if (icon.children) {
    child.children = icon.children.map((subItem) => ({
      key: subItem.path,
      label: subItem.label,
      icon: subItem.icon ? iconToElement(subItem.icon) : undefined,
    }));
  }

  return child;
});

const CommonAsider = ({ collapsed }) => {
  const navigate = useNavigate();

  // 處理菜單點擊事件
  const handleMenuClick = ({ key }) => {
    navigate(key); // 跳轉到對應的路由
  };

  console.log(collapsed, "commondasider");
  return (
    <Sider trigger={null} collapsed={collapsed}>
      <div className="app-name">
        {collapsed ? (
          <img src={camsLogo} alt="CAMS Logo" style={{ maxWidth: '80%', margin: '10px auto', display: 'block' }} />
        ) : (
          <h3>CAMS CW SYSTEM</h3>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{
          height: "100%",
        }}
        onClick={handleMenuClick} // on click event
      />
    </Sider>
  );
};

export default CommonAsider;
