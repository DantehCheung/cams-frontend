import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./route";

function App() {
  return (
    <div className="app">
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default App;
