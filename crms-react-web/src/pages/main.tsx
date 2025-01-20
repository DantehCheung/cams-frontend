import React from "react";
import { Outlet } from "react-router-dom"; // for children class exit
// the children route content will put into outlet component
const Main = () => {
  return (
    <div>
      Main
      <Outlet />
    </div>
  );
};

export default Main;
