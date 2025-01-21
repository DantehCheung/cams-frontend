import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../pages/main";
import Home from "../pages/home";
import Item from "../pages/item";
import User from "../pages/user";
import PageOne from "../pages/other/pageOne";
import PageTwo from "../pages/other/pageTwo";

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
        Component: User,
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
