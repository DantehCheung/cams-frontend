import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./route/index.jsx";
import React from "react";

function App() {
  return (
    <div className="app">
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
