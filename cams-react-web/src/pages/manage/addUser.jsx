
import React, { useState } from "react";
import { Upload, Button, Card, Typography, Divider, notification } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { assetService } from "../../api";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

const AddUser = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const processExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const transformed = jsonData.map(row => ({
          CNA: row.CNA,
          emailDomain: row.emailDomain,
          password: row.password,
          accessLevel: Number(row.accessLevel),
          accessPage: row.accessPage ? Number(row.accessPage) : null,
          firstName: row.firstName,
          lastName: row.lastName,
          contentNo: row.contentNo,
          campusID: Number(row.campusID),
        }));

        resolve({
          userList: transformed
        });
      };
      reader.onerror = error => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

 /**
  *  const debug = async () => {
    if (!selectedFile) {
      console.log("No file selected yet.");
      return;
    }
    console.log("Debugging AddUser component");
    const payload = await processExcel(selectedFile);
    console.log("Processed payload:", payload);
    console.log("Processed payload (string):", JSON.stringify(payload));
  };
  */

  const handleUpload = async() => {
   try{
    const payload = await processExcel(selectedFile);
    // const userList = JSON.stringify(payload);

    const result = await assetService.addUser(payload);
    if(result.data.status === true){
      notification.success({
        message: 'Success',
        description: 'Users added successfully!'
      });
    }else{
      notification.error({
        message: 'Error',
        description: result.data.message || 'Failed to add users.'
      });
      
    }
   }catch(error){
    console.error("Error uploading users:", error);
    notification.error({
      message: 'Error',
      description: 'An error occurred while uploading users.'
    });
   }
  }

  return (
    <Card>
      <Title level={2}>Add User</Title>
      <Paragraph>Upload a CSV or Excel file to create new users.</Paragraph>
      <Divider/>
      <Dragger
        accept=".xlsx,.xls"
        maxCount={1}
        beforeUpload={() => false} // Prevents auto-upload
        onChange={(info) => {
          if (info.fileList.length > 0) {
            setSelectedFile(info.fileList[0].originFileObj);
          } else {
            setSelectedFile(null);
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag Excel file to this area</p>
        <p className="ant-upload-hint">
          Support for a single upload. File must match the template format.
        </p>
      </Dragger>
      <Divider/>
      <Button
        type="primary"
        icon={<UploadOutlined/>}
        onClick={handleUpload}
        style={{ marginTop: 16 }}
      >
        Submit
      </Button>
    </Card>
  );
};

export default AddUser;