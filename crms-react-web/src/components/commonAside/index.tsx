import React from "react";
import * as Icon from "@ant-design/icons";

import { Button, Layout, Menu, theme } from "antd";
import MainConfig from "../../config";

const { Header, Sider, Content } = Layout;

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
    }));
  }

  return child;
});

const CommonAsider: React.FC = ({ collapsed }) => {
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
      />
    </Sider>
  );
};

export default CommonAsider;
