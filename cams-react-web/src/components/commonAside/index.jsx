import React, { useMemo } from "react";
import * as Icon from "@ant-design/icons";

import { Layout, Menu, Tooltip } from "antd";
import MainConfig from "../../config";
import { useNavigate } from "react-router-dom";
import camsLogo from "../../assets/images/camslogo.png";
import { useAuth } from "../../context/AuthContext";
import { PAGE_PERMISSIONS } from "../../api";

const { Sider } = Layout;




// Safely create icon element
const iconToElement = (name) => {
  const IconComponent = Icon[name];
  if (IconComponent) {
    return React.createElement(IconComponent);
  }
  return null;
};

// Map routes to page permissions
const routePermissionMap = {
  // Home
  "/home": PAGE_PERMISSIONS.HOME,
  
  // Borrow & Return
  "/br/borrow": PAGE_PERMISSIONS.BORROW,
  "/br/return": PAGE_PERMISSIONS.RETURN,
  "/br/check": PAGE_PERMISSIONS.CHECK,

  // Manage
  "/manage/manageUser": PAGE_PERMISSIONS.USER_MANAGEMENT,
  "/manage/manageReport": PAGE_PERMISSIONS.REPORT,
  "/manage/manageCampus": PAGE_PERMISSIONS.CAMPUS_MANAGEMENT,
  "/manage/manageRoom": PAGE_PERMISSIONS.ROOM_MANAGEMENT,
  "/manage/manageItem": PAGE_PERMISSIONS.ITEM_MANAGEMENT,
  
  // Other
  "/other/connectRFID": PAGE_PERMISSIONS.RFID,
  "/other/downloadVer": 0, // No specific permission
  "/userInfo": PAGE_PERMISSIONS.USER_INFO
};

const CommonAsider = ({ collapsed }) => {
  const navigate = useNavigate();
  const { hasPermission, accessLevel } = useAuth();

  // Process menu data with permission checks
  const menuItems = useMemo(() => {
    return MainConfig.map((icon) => {
      const menuPermission = routePermissionMap[icon.path] || 0;
      const itemDisabled = !hasPermission(accessLevel, menuPermission);
      
      const child = {
        key: icon.path,
        icon: icon.icon ? iconToElement(icon.icon) : undefined,
        label: itemDisabled ? (
          <Tooltip title="You don't have permission to access this page">
            <span>{icon.label}</span>
          </Tooltip>
        ) : icon.label,
        disabled: itemDisabled,
      };

      if (icon.children) {
        // Process children and check if all children are disabled
        const processedChildren = icon.children.map((subItem) => {
          const subPermission = routePermissionMap[subItem.path] || 0;
          const subDisabled = !hasPermission(accessLevel, subPermission);
          
          return {
            key: subItem.path,
            label: subDisabled ? (
              <Tooltip title="You don't have permission to access this page">
                <span>{subItem.label}</span>
              </Tooltip>
            ) : subItem.label,
            icon: subItem.icon ? iconToElement(subItem.icon) : undefined,
            disabled: subDisabled,
          };
        });
        
        child.children = processedChildren;
        
        // If all children are disabled, disable the parent too
        if (processedChildren.every(item => item.disabled)) {
          child.disabled = true;
        }
      }

      return child;
    });
  }, [hasPermission, accessLevel]);

  // Handle menu click event
  const handleMenuClick = ({ key }) => {
    navigate(key); // Navigate to the selected route
  };

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
        items={menuItems}
        style={{
          height: "100%",
        }}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default CommonAsider;
