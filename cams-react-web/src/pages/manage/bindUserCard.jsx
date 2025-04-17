import React, { useEffect, useState } from 'react'
import { Form, Input, Upload, Button, Card, Typography, Divider, notification} from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { assetService } from '../../api';


const { Title, Paragraph } = Typography;

const bindUserCard = () => {

    const [linkForm] = Form.useForm();
    const [cardId, setCardId] = useState('');

    // Add this useEffect to update the form when cardId changes
    useEffect(() => {
        if (cardId && cardId.length === 10) {
            // Update the form field with the scanned cardId
            linkForm.setFieldsValue({
                targetSID: cardId
            });
        }
    }, [cardId, linkForm]);

    useEffect(() => {
        // Function to handle keydown events
        const handleKeyDown = (event) => {
            // If it's a digit, add it to the cardId state
            if (/^\d$/.test(event.key) && (!document.activeElement || !document.activeElement.id.includes('targetCNA'))) {
                // Unfocus the CNA input when scanning starts
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                setCardId(prev => {
                    const newCardId = prev + event.key;
                    return newCardId;
                });
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleBinding = async () => {

        const params = linkForm.getFieldsValue();

        const result = await assetService.bindUserCard(params.targetCNA, params.targetSID);

        if(result.data.status === true){
            notification.success({
                message: 'Binding Successful',
                description: `CNA ${params.targetCNA} has been successfully linked with Student ID ${params.targetSID}.`,
            });
            setCardId(''); // Reset cardId after successful binding
            linkForm.resetFields(); // Reset form fields
        }else{
            notification.error({
                message: 'Binding Failed',
                description: result.data.message || 'An error occurred while binding the CNA with the Student ID Card.',
            });
            setCardId(''); // Reset cardId on failure
            linkForm.resetFields(); // Reset form fields
        }
    }


    return (
        <Card>
            <Title level={2}>Link CNA with Student ID Card</Title>
            <Paragraph>Fill the Target CNA, and Scan the specific Student ID Card </Paragraph>
            <Divider />
            <Form form={linkForm} layout="vertical" >
                <Form.Item label="Target CNA" name="targetCNA" rules={[{ required: true, message: 'Please input the Target CNA!' }]}>
                    <Input placeholder="Enter 9 characters CNA Example: 123456789" maxLength={9} />
                </Form.Item>
                <Form.Item label="Target Student ID" name="targetSID" rules={[{ required: true, message: 'Please press the Student ID Card!' }]}>
                    <Input value={cardId} placeholder="Press the Student ID Card" type='password' maxLength={10} disabled={true} />
                </Form.Item>
                <Divider />
                <Button
                    type='primary'
                    icon={<UploadOutlined />}
                    onClick={handleBinding}
                >
                    Bind
                </Button>
                <Button style={{ marginLeft: '10px' }}
                    onClick={() => {
                        setCardId('');
                        linkForm.resetFields(); // This resets all form fields to initial values
                    }}
                    type="primary" danger>
                    Reset
                </Button>
            </Form>
        </Card>
    );

}

export default bindUserCard