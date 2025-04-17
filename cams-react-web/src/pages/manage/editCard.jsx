import React, {useState, useEffect} from 'react';
import { Form, Input, Button, Card, Typography, notification, Divider, Select, Radio } from 'antd';
import { InboxOutlined, UploadOutlined, SwapOutlined } from '@ant-design/icons';
import { assetService } from '../../api';
const { Title, Paragraph, Text } = Typography;

const EditCard = () => {
    const [editForm] = Form.useForm();
    const [cardId, setCardId] = useState('');
    const [activeField, setActiveField] = useState('cardID'); // Track which field is receiving input
    const stateData = [
        { label: 'Active', value: 'A' },
        { label: 'Destroyed', value: 'D' },
    ];

    // Update the form when cardId changes based on active field
    useEffect(() => {
        if (cardId && cardId.length === 10) {
            // Update the appropriate field with the scanned cardId
            if (activeField === 'cardID') {
                editForm.setFieldsValue({
                    cardID: cardId
                });
            } else {
                editForm.setFieldsValue({
                    newCardID: cardId
                });
            }
            setCardId(''); // Reset for next scan
        }
    }, [cardId, editForm, activeField]);
    
    useEffect(() => {
        // Function to handle keydown events
        const handleKeyDown = (event) => {
            // If it's a digit, add it to the cardId state
            if (/^\d$/.test(event.key)) {
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

    const handleEdit = async() => {
        const params = {};
        const formValues = editForm.getFieldsValue();
        params.cardID = formValues.cardID;
        params.newCardID = formValues.newCardID;
        params.targetState = formValues.targetState;
        
        //console.log(params)

        const result = await assetService.editCard(params);
        
        if(result.data.status === true){
            notification.success({
                message: 'Edit Successful',
                description: `Card ID ${params.cardID} has been updated to ${params.newCardID} with state ${params.targetState}.`,
            });
            setCardId('');
            editForm.resetFields();
        }else{
            notification.error({
                message: 'Edit Failed',
                description: result.data.message || 'An error occurred while editing the card.',
            });
            setCardId('');
            editForm.resetFields();
        }
    }

    return(
        <Card>
            <Title level={2}>Edit User Card</Title>
            <Paragraph>Select which card to scan, then scan the respective cards</Paragraph>
            <Divider />
            
            <Radio.Group 
                value={activeField}
                onChange={(e) => {
                    setActiveField(e.target.value);
                    setCardId(''); // Clear any partial scan when switching
                }}
                style={{ marginBottom: '16px' }}
            >
                <Radio.Button value="cardID">Scan Target Card</Radio.Button>
                <Radio.Button value="newCardID">Scan New Card</Radio.Button>
            </Radio.Group>
            
            <Form form={editForm} layout="vertical">
                <Form.Item 
                    label="Target Card ID" 
                    name="cardID" 
                    rules={[{ required: true, message: 'Please scan a target card!' }]}
                >
                    <Input 
                        placeholder="Press the target Student ID Card" 
                        type='password' 
                        maxLength={10} 
                        disabled={true}
                        style={{ background: activeField === 'cardID' ? '#f6ffed' : '' }}
                    />
                </Form.Item>
                
                <Form.Item 
                    label="New Card ID" 
                    name="newCardID" 
                    rules={[{ required: true, message: 'Please scan a new card!' }]}
                >
                    <Input 
                        placeholder="Press the new target Student ID Card" 
                        type='password' 
                        maxLength={10} 
                        disabled={true}
                        style={{ background: activeField === 'newCardID' ? '#f6ffed' : '' }}
                    />
                </Form.Item>
                
                <Form.Item 
                    label="State" 
                    name="targetState"
                    rules={[{ required: true, message: 'Please select a state!' }]}
                    initialValue="A"
                >
                    <Select options={stateData} />
                </Form.Item>
                
                <Divider />
                
                <Button 
                    type='primary' 
                    icon={<UploadOutlined />}
                    onClick={handleEdit}
                >
                    Submit
                </Button>
                
                <Button 
                    style={{ marginLeft: '10px' }} 
                    type="primary" 
                    danger
                    onClick={() => {
                        setCardId('');
                        editForm.resetFields();
                    }}
                >
                    Reset
                </Button>
            </Form>
        </Card>
    );
}

export default EditCard;