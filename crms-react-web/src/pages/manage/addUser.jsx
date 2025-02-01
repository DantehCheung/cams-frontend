import React from "react";
import { Typography, Card, Divider } from "antd";
import Upload from "../../components/commonUtils/commonUpload";

const { Title, Paragraph } = Typography;

const AddUser = () => {
  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Add User</Title>
        <Paragraph>Upload a CSV or Excel file to create new users.</Paragraph>
        <Divider />
        <Upload />
      </Card>
    </div>
  );
};

export default AddUser;