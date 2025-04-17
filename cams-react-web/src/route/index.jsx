import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../pages/main.jsx";
import Home from "../pages/home";
//import AddUser from "../pages/manage/addUser";
import ManageUser from "../pages/manage/manageUser";
import ConnectRFID from "../pages/other/connectRFID";
import DownloadVer from "../pages/other/downloadVer.jsx"
import GenReport from "../pages/manage/genReport";
import ManageCampus from "../pages/manage/manageCampus";
import ManageRoom from "../pages/manage/manageRoom";
import ManageItem from "../pages/manage/manageItem";
import Borrow from "../pages/br/borrow";
import Return from "../pages/br/return";
import Check from "../pages/br/check";
import React from "react";
import Login from "../pages/login";
import UserInfo from "../pages/user/UserInfo.jsx";
import ProtectedRoute from "../components/ProtectedRoute";
import { PAGE_PERMISSIONS, ACCESS_LEVELS } from "../api";

const routes = [
  {
    path: "/",
    Component: Main,
    children: [
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "home",
        element: (
          <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.HOME}>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "br",
        children: [
          {
            path: "borrow",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.GUEST} requiredPageBit={PAGE_PERMISSIONS.BORROW}>
                <Borrow />
              </ProtectedRoute>
            ),
          },
          {
            path: "return",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.GUEST} requiredPageBit={PAGE_PERMISSIONS.RETURN}>
                <Return />
              </ProtectedRoute>
            ),
          },
          {
            path: "check",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.CHECK}>
                <Check />
              </ProtectedRoute>
            )
          }
        ],
      },
      {
        path: "manage",
        children: [
          {
            path: "manageUser",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.USER_MANAGEMENT}>
                <ManageUser />
              </ProtectedRoute>
            ),
          },
          {
            path: "genReport",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.REPORT}>
                <GenReport />
              </ProtectedRoute>
            ),
          },
          {
            path: "manageCampus",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.CAMPUS_MANAGEMENT}>
                <ManageCampus />
              </ProtectedRoute>
            ),
          },
          {
            path: "manageRoom",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.ROOM_MANAGEMENT}>
                <ManageRoom />
              </ProtectedRoute>
            ),
          },
          {
            path: "manageItem",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.ITEM_MANAGEMENT}>
                <ManageItem />
              </ProtectedRoute>
            ),
          }
        ],
      },
      {
        path: "other",
        children: [
          {
            path: "connectRFID",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.GUEST} requiredPageBit={PAGE_PERMISSIONS.RFID}>
                <ConnectRFID />
              </ProtectedRoute>
            ),
          },
          {
            path: "downloadVer",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.GUEST} requiredPageBit={0}>
                <DownloadVer />
              </ProtectedRoute>
            ),
          },
          {
            path:"rfidTest",
            element: (
              <ProtectedRoute requiredLevel={ACCESS_LEVELS.GUEST} requiredPageBit={PAGE_PERMISSIONS.RFID}>
                {/* Component for RFID test page */}
              </ProtectedRoute>
            ),
          }
        ],
      },{
        path:"userInfo",
        element: (
          <ProtectedRoute requiredLevel={ACCESS_LEVELS.TEACHER} requiredPageBit={PAGE_PERMISSIONS.USER_INFO}>
            <UserInfo />
          </ProtectedRoute>
        ),
      }
    ],
  },
  {
    path:"login",
    Component: Login,
  }
];

export default createBrowserRouter(routes);