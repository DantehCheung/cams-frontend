
import React, { useState, useEffect } from "react";
import { Upload, Button, Card, Typography, Divider, notification, Row, Col, Space } from "antd";
import { InboxOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx-js-style';
import { assetService } from "../../api";


const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

const AddUser = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);




  const generateTemplate = () => {



    // Create template workbook
    const wb = XLSX.utils.book_new();
    const templateData = [{
      CNA: "",
      emailDomain: "",
      password: "",
      accessLevel: "",
      accessPage: "",
      firstName: "",
      lastName: "",
      contentNo: "",
      campusID: ""
    }];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);


    // Add styling
    const HEADER_BG_COLOR = 'FF4472C4';
    const HEADER_FONT_COLOR = 'FFFFFFFF';

    // Get header range (first row)
    const range = XLSX.utils.decode_range(ws['!ref']);
    const headerRow = range.s.r; // Should be 0 for first row

    // Style headers
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: {
            name: 'Arial',
            sz: 12,
            bold: true,
            color: { rgb: HEADER_FONT_COLOR }
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: HEADER_BG_COLOR }
          },
          alignment: {
            vertical: "center",
            horizontal: "center"
          }
        };
      }
    }

    // Style data rows
    const dataRange = XLSX.utils.decode_range(ws['!ref']);
    for (let row = dataRange.s.r + 1; row <= dataRange.e.r; row++) {
      for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: {
              name: 'Arial',
              sz: 11
            }
          };
        }
      }
    }
    
    // Set column widths (adjust as needed)
    ws['!cols'] = [
      { wch: 15 }, // CNA
      { wch: 20 }, // emailDomain
      { wch: 15 }, // password
      { wch: 15 }, // accessLevel
      { wch: 20 }, // accessPage
      { wch: 15 }, // firstName
      { wch: 15 }, // lastName
      { wch: 15 }, // contentNo
      { wch: 15 }  // campusID
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Convert to blob and download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'addUserSample.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


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

          >
            <Button type="link" icon={<DownloadOutlined />} style={{ padding: 0 }} onClick={generateTemplate}>
              Download Template
            </Button>
          </a>
        </Space>
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f0f5ff', borderRadius: 8 }}>
          <Title level={5} style={{ marginBottom: 12 }}>Instructions:</Title>
          <ol style={{ paddingLeft: 24, margin: 0 }}>
            <li>CNA should be 9 charaters</li>
            <li>email should be contains @ symbol</li>
          </ol>
        </div>
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