import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Table, Space, Modal, Typography, Select, message, Spin, notification, Divider, DatePicker, Row, Col} from "antd";
import { ReloadOutlined, CheckCircleOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons';
const { Title, Paragraph, Text } = Typography;
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { assetService } from '../../../api';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const dateFormat = 'YYYY-MM-DD';


const overdueDeviceReport = () => {

    const initialRooms = [];
    const [reportForm] = Form.useForm();
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState(initialRooms);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Define Excel columns (match API keys with desired headers)
    const columns = [
        { header: "Device ID", key: "deviceID" },
        { header: "Device Name", key: "deviceName" },
        { header: "Borrow CNA", key: "borrowerCNA" },
        { header: "Borrow Name", key: "borrowerName" },
        { header: "Phone Number", key: "phoneNumber" },
        { header: "Campus Name", key: "returnDate" },
        { header: "Room Number", key: "returnStatus" },
        { header: "Expire Date", key: "inspectionTime" },
        { header: "Device Price", key: "inspector" },
    ];

    useEffect(() => {
        const fetchCampusData = async () => {
            try {
                setLoading(true);
                const response = await assetService.getCampusData();

                // Log the entire response for debugging
                console.log('Campus data response:', response);

                // Check various possible response formats
                if (response && Array.isArray(response.c)) {
                    console.log('Found campus data in response.c format');
                    // Format the campus data for the select field
                    const formattedCampuses = response.c.map(campus => ({
                        key: campus.campusId.toString(),
                        fullName: campus.campusName,
                        shortName: campus.campusShortName
                    }));
                    setCampuses(formattedCampuses);
                } else {
                    // Fallback if API response format is unexpected
                    console.warn('Unexpected API response format:', response);
                    setCampuses([]);
                }
            } catch (error) {
                console.error('Failed to fetch campus data:', error);
                message.error('Failed to load campus data');
                setCampuses([]); // Set empty array if fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchCampusData();
    }, []);

    const handleCampusChange = (value) => {
        setSelectedCampus(value);
        // TODO: filter or update rooms based on selected campus if needed
    };

    const handleSort = async () => {
        if (!selectedCampus) {
            message.warning('Please select a campus first');
            return;
        }

        try {
            setLoading(true);
            // Call the API to get rooms for the selected campus
            const response = await assetService.getRoomsByCampus(selectedCampus);

            if (response.success && response.data.rooms) {
                // Format the rooms data for the table
                const formattedRooms = response.data.rooms.map(room => ({
                    key: room.room.toString(),
                    roomId: room.room,
                    campusId: room.campusId,
                    roomNumber: room.roomNumber,
                    name: room.roomName || room.roomNumber // Use roomName if available, fallback to roomNumber
                }));

                setRooms(formattedRooms);
                message.success(`Loaded ${formattedRooms.length} rooms from selected campus`);
            } else {
                message.error(`Failed to load rooms: ${response.error?.description || 'Unknown error'}`);
                setRooms([]);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            message.error(`Failed to load rooms: ${error.message}`);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };



    const tableColumns = [
        { title: 'Room Number', dataIndex: 'roomNumber', key: 'roomNumber' },
        { title: 'Room Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleReport(record)} icon={<UploadOutlined />}>Generate Report</Button>
                </Space>
            ),
        },
    ];



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
        XLSX.utils.book_append_sheet(wb, ws, 'Overdue Device');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });



        notification.success({
            message: 'Success',
            description: 'Overdue Devices report generated successfully!',
        });

        // Trigger download
        saveAs(blob, "overdue_device.xlsx");


    }



    const handleReport = async (record) => {

        try {

            // Format the date as needed (e.g., YYYY-MM-DD)
            const formattedDate = selectedDate.format('YYYY-MM-DD');

            const params = {
                campusID: selectedCampus,
                roomID: record.roomId,
                cutoffDate: formattedDate  // Add the date to your parameters
            }

            const result = await assetService.generateOverdueReport(params);

            console.log(result)
            console.log(result.data)
            console.log(result.data.devices.length)
            console.log(result.data.devices)

            if (result.success === true && result.data.devices.length > 0) {
                ExcelExporter(result.data);
                reportForm.resetFields();
            } else {
                notification.error({
                    message: 'Error',
                    description: 'No records found for the selected room.',
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
            <Title level={2}>Overdue Device Report</Title>
            <Divider />

            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f0f5ff', borderRadius: 8 }}>
                <Title level={5} style={{ marginBottom: 12 }}>Instructions:</Title>
                <ol style={{ paddingLeft: 24, margin: 0 }}>
                    <li>1. Please select a campus</li>
                    <li>2. Then, select a cut off day you want</li>
                    <li>3. Lastly, select a room and click generate report</li>
                </ol>
            </div>
            <Divider />
            <Form form={reportForm} layout="vertical" style={{ marginTop: 16 }}>


            
                    <Space style={{ marginBottom: 16 }}>
                        <Select
                            placeholder="Select Campus"
                            style={{ width: 150 }}
                            onChange={handleCampusChange}
                            value={selectedCampus}
                            loading={loading}
                        >
                            {campuses.map(campus => (
                                <Select.Option key={campus.key} value={campus.key}>
                                    {campus.shortName}
                                </Select.Option>
                            ))}
                        </Select>
                        <Button type="primary" onClick={handleSort}>
                            Select
                        </Button>
                    </Space>

                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={8}>
                            <Form.Item 
                                   label={
                                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#333', marginLeft: '3  px' }}>
                                        Select Cut Off Day
                                    </span>
                                }
                            >
                                <DatePicker
                                    defaultValue={dayjs()}
                                    format={dateFormat}
                                    onChange={(date) => setSelectedDate(date)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
              

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table columns={tableColumns} dataSource={rooms} />
                )}
            </Form>
        </Card>
    );
}

export default overdueDeviceReport;