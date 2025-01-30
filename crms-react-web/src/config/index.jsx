export default [
  {
    path: "/home",
    name: "home",
    label: "Home",
    url: "/home/index",
    icon: "HomeOutlined",
  },
  {
    path: "/item",
    name: "item",
    label: "Item",
    url: "/item/index",
    icon: "LaptopOutlined",
  },
  {
    path: "/user",
    label: "User",
    icon: "UserOutlined",
    children: [
      {
        path: "/user/addUser",
        name: "addUser",
        label: "Add User",
        icon: "UserAddOutlined",
      },
    ],
  },
  {
    path: "/manage",
    label: "Data Manage",
    icon: "DatabaseOutlined",
    children: [
      {
        path: "/manage/addUser",
        name: "addUser",
        label: "Add User",
        icon: "UserAddOutlined",
      },
    ],
  },
  {
    path: "/other",
    label: "Other",
    icon: "SettingOutlined",
    children: [
      {
        path: "/other/pageOne",
        name: "page1",
        label: "Page 1",
        icon: "SettingOutlined",
      },
      {
        path: "/other/pageTwo",
        name: "page2",
        label: "Page 2",
        icon: "SettingOutlined",
      },
      {
        path: "/other/connectRFID",
        name: "connectRFID",
        label: "Connect RFID",
        icon: "SettingOutlined",
      },
    ],
  },
];
