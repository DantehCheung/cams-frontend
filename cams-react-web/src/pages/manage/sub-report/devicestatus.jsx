import React, { useState, useEffect, useForm, useRef } from 'react';
import { Form, Input, Button, Card, Typography, notification, Divider } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { assetService } from '../../../api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';

const { Title, Paragraph, Text } = Typography;





const deviceStatusReport = () => {


    const [reportForm] = Form.useForm();

    // Define Excel columns (match API keys with desired headers)
    const columns = [
        { header: "Device ID", key: "deviceID" },
        { header: "Device Name", key: "deviceName" },
        { header: "Status", key: "status" },
        { header: "Location", key: "location" },
        { header: "Last Borrower", key: "lastBorrower" },
    ]


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
        const records = reportData.devices;

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
        XLSX.utils.book_append_sheet(wb, ws, 'Device Status');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });



        notification.success({
            message: 'Success',
            description: 'Device Status Report generated successfully!',
        });

        // Trigger download
        saveAs(blob, "devices_status.xlsx");


    }



    const handleReport = async () => {

        try {

            const result = await assetService.generateDeviceStatusReport();

            if (result.success === true && result.data.devices.length > 0) {
                ExcelExporter(result.data);
                reportForm.resetFields();
            } else {
                notification.error({
                    message: 'Error',
                    description: 'An error occurred while generating the report.',
                });

            }
        } catch (error) {
            console.error('Error generating report:', error);
            notification.error({
                message: 'Error',
                description: 'An error occurred while generating the report.',
            });

        }

    }




    return (
        <Card>
            <Title level={2}>Device Status Report</Title>
            <Divider/>
            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f0f5ff', borderRadius: 8 }}>
                <Title level={5} style={{ marginBottom: 12 }}>Instructions:</Title>
                <ol style={{ paddingLeft: 24, margin: 0 }}>
                    <li>1. Please click the generate button.</li>
                    <li>2. The result will export as a Excel file.</li>
                </ol>
            </div>
            <Divider />
            <Form form={reportForm} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={handleReport} icon={<ExportOutlined />}>Generate</Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default deviceStatusReport;