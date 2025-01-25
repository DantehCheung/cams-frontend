import React from "react";
import * as Icon from "@ant-design/icons";

import { Layout, Menu } from "antd";
import MainConfig from "../../config";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

// Define types
interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

interface MainConfigItem {
  path: string;
  label: string;
  icon?: string;
  children?: MainConfigItem[];
  name?: string;
  url?: string;
}

type IconName = keyof typeof Icon;

// Safely create icon element
const iconToElement = (name: IconName) => {
  const IconComponent = Icon[name];
  if (IconComponent) {
    return React.createElement(IconComponent);
  }
  return null;
};

// Process menu data
const items: MenuItem[] = MainConfig.map((icon: MainConfigItem) => {
  const child: MenuItem = {
    key: icon.path,
    icon: icon.icon ? iconToElement(icon.icon as IconName) : undefined,
    label: icon.label,
  };

  if (icon.children) {
    child.children = icon.children.map((subItem) => ({
      key: subItem.path,
      label: subItem.label,
      icon: subItem.icon ? iconToElement(subItem.icon as IconName) : undefined,
    }));
  }

  return child;
});

const CommonAsider: React.FC = ({ collapsed }) => {
  const navigate = useNavigate();

  // 處理菜單點擊事件
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key); // 跳轉到對應的路由
  };

  console.log(collapsed, "commondasider");
  return (
    <Sider trigger={null} collapsed={collapsed}>
      <h3 className="app-name">{collapsed ? "CRMS" : "CRMS CW SYSTEM"}</h3>
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
