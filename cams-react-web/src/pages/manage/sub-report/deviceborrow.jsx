import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification,Divider} from 'antd';
import {assetService} from '../../../api';

const{ Title, Paragraph, Text } = Typography;

const deviceBorrowReport = () => {

const handleReport = async () => {

    const targetCNA = form.getFieldValue('targetCNA');
   
    const result = await assetService.generateBorrowReport({targetCNA: targetCNA});

    

}





    return(
        <Card>
            <Title level={2}>Device Borrow Report</Title>
            <Paragraph>Fill the Target CNA, and click generate button</Paragraph>
            <Divider/>
            <Form layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="Target CNA" name="targetCNA" rules={[{ required: true, message: 'Please input the Target CNA!', min:8, max:8 }]}>
                    <Input placeholder="Enter Target CNA" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Generate</Button>
                </Form.Item>
                </Form>
        </Card>
    );
}

export default deviceBorrowReport;