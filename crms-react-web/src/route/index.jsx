import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../pages/main.jsx";
import Home from "../pages/home";
import Item from "../pages/item";
import PageOne from "../pages/other/pageOne";
import PageTwo from "../pages/other/pageTwo";
import addUser from "../pages/manage/addUser";
import connectRFID from "../pages/other/connectRFID";
import React from "react";

const routes = [
  {
    path: "/",
    Component: Main,
    children: [
      //redirect to home, using navigate component from react-router-dom
      {
        path: "/",
        element: <Navigate to="/home" />,
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
          {
            path: "connectRFID",
            Component: connectRFID,
          },
        ],
      },
    ],
  },
];

export default createBrowserRouter(routes);
