import React from "react";
import Upload from "../../components/commonUtils/commonUpload";
import { Typography } from "antd";
const { Title } = Typography;
const addUser = () => {
  console.log("add user");
  return (
    <>
      <Title level={2}>Add User</Title>
      <Upload />
    </>
  );
};
export default addUser;
