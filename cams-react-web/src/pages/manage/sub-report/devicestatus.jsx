import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification, Divider } from 'antd';
const{ Title, Paragraph, Text } = Typography;
const deviceStatusReport = () => {



    return (
        <Card>
            <Title level={2}>Device Status Report</Title>
            <Paragraph>Click Generate</Paragraph>
            <Divider />
        </Card>
    );
}

export default deviceStatusReport;