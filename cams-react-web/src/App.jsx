import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./route/index.jsx";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { RfidProvider } from "./context/RfidContext";

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <RfidProvider>
          <RouterProvider router={router}></RouterProvider>
        </RfidProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
