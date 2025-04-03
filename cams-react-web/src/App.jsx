import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./route/index.jsx";
import React from "react";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <RouterProvider router={router}></RouterProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
