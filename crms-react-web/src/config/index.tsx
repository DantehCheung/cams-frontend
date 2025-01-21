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
    name: "user",
    label: "User",
    url: "/user/index",
    icon: "UserOutlined",
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
    ],
  },
];
