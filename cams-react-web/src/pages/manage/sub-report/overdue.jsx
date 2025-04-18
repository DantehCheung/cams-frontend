import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification, Divider } from 'antd';
const { Title, Paragraph, Text } = Typography;

const overdueDeviceReport = () => {


    const [reportForm] = Form.useForm();

    // Define Excel columns (match API keys with desired headers)
    const columns = [
        { header: "Device ID", key: "deviceID" },
        { header: "Device Name", key: "deviceName"  },
        { header: "Borrow CNA", key: "borrowerCNA"  },
        { header: "Borrow Name", key: "borrowerName"  },
        { header: "Phone Number", key: "phoneNumber"  },
        { header: "Campus Name", key: "returnDate"  },
        { header: "Room Number", key: "returnStatus"  },
        { header: "Expire Date", key: "inspectionTime"  },
        { header: "Device Price", key: "inspector"  },
    ];

    /**
     * 
     *    val deviceID: Int,
        val deviceName: String,
        val borrowerCNA: String,
        val borrowerName: String,
        val phoneNumber: String,
        val campusName: String,
        val roomNumber: String,
        val borrowDate: LocalDate,
        val expirationDate: LocalDate,
        val devicePrice: Double
     */

    const calculateWidths = (data) => {
        return columns.map(col => {
          const maxContentLength = Math.max(
            col.header.length, // Header length
            ...data.map(item => String(item[col.key]).length
          ));
          return { wch: maxContentLength + 2 }; // Add padding
        });
      };


    const ExcelExporter = (reportData) => {
        // Extract the records array
        const records = reportData.records;

        // Create worksheet with column order
        const ws = XLSX.utils.json_to_sheet(records, {
            header: columns.map(c => c.key) // Use keys from columns definition
        });

        


        ws['!cols'] = calculateWidths(records);

        /**columns.map(col => ({ 
            wch: col.width,                // Width in characters
            // For pixel width (optional): width: 100 
          }));
 */

        // Apply font style to all cells (including headers)
        const setCellStyles = (ws) => {
            const range = XLSX.utils.decode_range(ws['!ref']);

            // Define colors
            const HEADER_BG_COLOR = 'FF4472C4'; // Light blue (Excel color code)
            const HEADER_FONT_COLOR = 'FFFFFFFF'; // White



            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                  const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                  if (ws[cellAddress]) {
                    // Common cell style
                    const cellStyle = {
                      font: {
                        name: 'Arial',
                        sz: 12,
                      },
                    };
          
                    // Header row styling (first row)
                    if (row === 0) {
                      cellStyle.fill = {
                        patternType: 'solid',
                        fgColor: { rgb: HEADER_BG_COLOR },
                      };
                      cellStyle.font.bold = true;
                      cellStyle.font.color = { rgb: HEADER_FONT_COLOR };
                    }
          
                    ws[cellAddress].s = cellStyle;
                  }
                }
              };
            
        };

        // Apply styles to worksheet
        setCellStyles(ws);

        // Create a new workbook, append the styled worksheet, and export as before
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Device Records');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });



        notification.success({
            message: 'Success',
            description: 'Report generated successfully!',
        });

        // Trigger download
        saveAs(blob, "device_records.xlsx");


    }

  

    const handleReport = async () => {

        try {
            const targetCNA = reportForm.getFieldValue('targetCNA');

            const result = await assetService.generateBorrowReport({ targetCNA: targetCNA });

            if (result.success === true && result.data.records.length > 0) {
                ExcelExporter(result.data);
                reportForm.resetFields();
            } else {
                notification.error({
                    message: 'Error',
                    description: 'No records found for the given CNA.',
                });
                reportForm.resetFields();
            }
        } catch (error) {
            console.error('Error generating report:', error);
            notification.error({
                message: 'Error',
                description: 'An error occurred while generating the report.',
            });
            reportForm.resetFields();
        }

    }











    return (
        <Card>
            <Title level={2}>Override Device Report</Title>
            <Paragraph>Choose the campus and room, and fill the cut off day</Paragraph>
            <Divider />
            <Form form={reportForm} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="Target CNA" name="targetCNA" rules={[{ required: true, message: 'Please input the Target CNA!', min: 8, max: 8 }]}>
                    <Input placeholder="Enter Target CNA" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={handleReport} icon={<ExportOutlined />}>Generate</Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default overdueDeviceReport;