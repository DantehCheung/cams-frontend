import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../pages/main";
import Home from "../pages/home";
import Item from "../pages/item";
import PageOne from "../pages/other/pageOne";
import PageTwo from "../pages/other/pageTwo";
import addUser from "../pages/manage/addUser";

const routes = [
  {
    path: "/",
    Component: Main,
    children: [
      //redirect to home, using navigate component from react-router-dom
      {
        path: "/",
        element: <Navigate to="home" replace />,
      },
      {
        path: "home",
        Component: Home,
      },
      {
        path: "item",
        Component: Item,
      },
      {
        path: "user",
        children: [
          {
            path: "addUser",
            Component: addUser,
          },
        ],
      },
      {
        path: "manage",
        children: [
          {
            path: "addUser",
            Component: addUser,
          },
        ],
      },
      {
        path: "other",
        children: [
          {
            path: "pageOne",
            Component: PageOne,
          },
          {
            path: "pageTwo",
            Component: PageTwo,
          },
        ],
      },
    ],
  },
];

export default createBrowserRouter(routes);
