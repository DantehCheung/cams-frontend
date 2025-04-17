export default [
  {
    path: "/home",
    name: "home",
    label: "Home",
    url: "/home/index",
    icon: "HomeOutlined",
  },
  {
    path: "/br",
    label: "Borrow & Return",
    icon: "BarcodeOutlined",
    children: [
      {
        path: "/br/borrow",
        name: "borrow",
        label: "Borrow",
        icon: "BarcodeOutlined",
      },
      {
        path: "/br/return",
        name: "return",
        label: "Return",
        icon: "BarcodeOutlined",
      },
      {
        path: "/br/check",
        name: "check",
        label: "Check",
        icon: "BarcodeOutlined",
      }
    ],
  },
  {
    path: "/manage",
    label: "Data Manage",
    icon: "DatabaseOutlined",
    children: [
      {
        path: "/manage/manageUser",
        name: "manageUser",
        label: "Manage User",
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
  }
];
