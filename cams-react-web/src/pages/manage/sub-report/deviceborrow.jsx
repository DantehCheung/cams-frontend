import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification,Divider} from 'antd';

const deviceBorrowReport = () => {

const{ Title, Paragraph, Text } = Typography;

    return(
        <Card>
            <Title level={2}>Device Borrow Report</Title>
            <Paragraph>Fill the Target CNA, and click generate button</Paragraph>
            <Divider/>
        </Card>
    );
}

export default deviceBorrowReport;