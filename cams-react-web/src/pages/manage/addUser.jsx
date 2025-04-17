
import React, { useState,useEffect } from "react";
import { Upload, Button, Card, Typography, Divider, notification ,Row,Col, Space} from "antd";
import { InboxOutlined, UploadOutlined ,DownloadOutlined  } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { assetService } from "../../api";


const { Title, Paragraph,Text } = Typography;
const { Dragger } = Upload;

const AddUser = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    setSelectedFile(null);
    setFileList([]);
}, [])

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

  const handleUpload = async () => {
    try {
      const payload = await processExcel(selectedFile);
      // const userList = JSON.stringify(payload);

      const result = await assetService.addUser(payload);
      if (result.data.status === true) {
        notification.success({
          message: 'Success',
          description: 'Users added successfully!'
        });
      } else {
        notification.error({
          message: 'Error',
          description: result.data.message || 'Failed to add users.'
        });

      }
    } catch (error) {
      console.error("Error uploading users:", error);
      notification.error({
        message: 'Error',
        description: 'User(s) has been existed.'
      });
    }
  }


  const handleClearFile = () => {
    setSelectedFile(null);
    setFileList([]); // Clear the file list to remove the displayed filename
  };

  return (
    <Card>
      <Title level={2}>Add User</Title>
      <Paragraph>Upload a Excel file to create new users.</Paragraph>
      <Paragraph>
                <Space>
                    <Text type="secondary">Need the right format?</Text>
                    <a 
                       href="/templates/addUserFormat.xlsx" 
                        download="addUserFormat.xlsx"
                    >
                        <Button type="link" icon={<DownloadOutlined />} style={{ padding: 0 }}>
                            Download Template
                        </Button>
                    </a>
                </Space>
            </Paragraph>
      <Divider />
      <Dragger
        accept=".xlsx,.xls"
        maxCount={1}
        fileList={fileList}
        disabled={selectedFile !== null} // Lock dragger when file is selected
        beforeUpload={() => false} // Prevents auto-upload
        onChange={(info) => {
          setFileList(info.fileList); // Track the file list
          if (info.fileList.length > 0) {
            setSelectedFile(info.fileList[0].originFileObj);
          } else {
            setSelectedFile(null);
          }
        }}
      >
        {selectedFile ? (
          <div>
            <p className="ant-upload-drag-icon" style={{ color: '#52c41a' }}>
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">File selected: {selectedFile.name}</p>
            <p className="ant-upload-hint">
              Click "Submit" to upload or remove this file to select another
            </p>
          </div>
        ) : (
          <>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag Excel file to this area</p>
            <p className="ant-upload-hint">
              Support for a single upload. File must match the template format.
            </p>
          </>
        )}
      </Dragger>
      <Divider />
      <Row gutter={16}>
        <Col span={12}>
          <Button
            onClick={handleClearFile}
            disabled={!selectedFile}
            style={{ marginTop: 16, width: '100%' }}
          >
            Clear File
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            disabled={!selectedFile}
            style={{ marginTop: 16, width: '100%' }}
          >
            Submit
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default AddUser;