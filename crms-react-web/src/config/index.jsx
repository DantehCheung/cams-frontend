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
    path: "/br",
    label: "Borrow & Return",
    icon: "LaptopOutlined",
    children: [
      {
        path: "/br/borrow",
        name: "borrow",
        label: "Borrow",
        icon: "LaptopOutlined",
      },
      {
        path: "/br/return",
        name: "return",
        label: "Return",
        icon: "LaptopOutlined",
      }
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
      {
        path: "/manage/genReport",
        name: "genReport",
        label: "Report",
        icon: "FileTextOutlined",
      },
      {
        path:"/manage/manageCampus",
        name:"manageCampus",
        label:"Campus",
        icon:"ApartmentOutlined"
      },
      {
        path:"/manage/manageRoom",
        name:"manageRoom",
        label:"Room",
        icon:"ApartmentOutlined"
      },
      {
        path:"/manage/manageItem",
        name:"manageItem",
        label:"Item",
        icon:"ApartmentOutlined"
      }
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
      {
        path:"/other/downloadVer",
        name:"downloadVer",
        label:"Download Version",
        icon:"CloudDownloadOutlined"
      }
    ],
  },
];
