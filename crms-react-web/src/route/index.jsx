import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../pages/main.jsx";
import Home from "../pages/home";
import Item from "../pages/item";
import PageOne from "../pages/other/pageOne";
import PageTwo from "../pages/other/pageTwo";
import addUser from "../pages/manage/addUser";
import connectRFID from "../pages/other/connectRFID";
import downloadVer from "../pages/other/downloadVer.jsx"
import  genReport from "../pages/manage/genReport";
import manageCampus from "../pages/manage/manageCampus";
import manageRoom from "../pages/manage/manageRoom";
import manageItem from "../pages/manage/manageItem";
import Borrow from "../pages/br/borrow";
import Return from "../pages/br/return";
import React, { Component } from "react";
import Login from "../pages/login";

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
        path: "br",
        children: [
          {
            path: "borrow",
            Component: Borrow,
          },
          {
            path: "return",
            Component: Return,
          }
        ],
      },
      {
        path: "manage",
        children: [
          {
            path: "addUser",
            Component: addUser,
          },
          {
            path: "genReport",
            Component: genReport,
          },
          {
            path: "manageCampus",
            Component: manageCampus,
          },
          {
            path: "manageRoom",
            Component: manageRoom,
          },
          {
            path: "manageItem",
            Component: manageItem,
          }
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
          {
            path: "downloadVer",
            Component: downloadVer,
          }
        ],
      }
    ],
  },
  {
      path:"login",
      Component: Login,
  }
];

export default createBrowserRouter(routes);
