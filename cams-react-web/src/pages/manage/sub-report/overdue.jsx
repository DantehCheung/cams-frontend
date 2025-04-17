import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification, Divider } from 'antd';
const{ Title, Paragraph, Text } = Typography;

const overdueDeviceReport = () => {



    return (
        <Card>
            <Title level={2}>Override Device Report</Title>
            <Paragraph>Choose the campus and room, and fill the cut off day</Paragraph>
            <Divider />
        </Card>
    );
}

export default overdueDeviceReport;