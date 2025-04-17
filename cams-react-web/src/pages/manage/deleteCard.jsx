import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification,Divider} from 'antd';
import { assetService } from '../../api';
import { DeleteOutlined,ClearOutlined  } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const deleteCard = () => {
    const [deleteForm] = Form.useForm();
    const [cardId, setCardId] = useState('');




            // Add this useEffect to update the form when cardId changes
            useEffect(() => {
                if (cardId && cardId.length === 10) {
                    // Update the form field with the scanned cardId
                    deleteForm.setFieldsValue({
                        cardID: cardId
                    });
                }
            }, [cardId, deleteForm]);


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
    
    const handleDelete = async () => {

        try{
            const delCardID = deleteForm.getFieldValue('cardID');
            if (!delCardID || delCardID.length !== 10) {
                notification.error({
                    message: 'Invalid Card ID',
                    description: 'Please ensure the Card ID is exactly 10 digits.',
                });
                return;
            }

            const result = await assetService.deleteCard(delCardID);

                 if(result.data.status === true){
                        notification.success({
                            message: 'Delete Successful',
                            description: `Card ID ${delCardID}} has been deleted with state D.`,
                        });
                        setCardId('');
                        deleteForm.resetFields();
                    }else{
                        notification.error({
                            message: 'Delete Failed',
                            description: result.data.message || 'An error occurred while delete the card.',
                        });
                        setCardId('');
                        deleteForm.resetFields();
                    }

        }catch(error){
            console.log(error.message);
            notification.error({
                message: 'Delete Error',
                description: 'An error occurred while deleting the card.',
            });
        }
    }

    return (
        <Card>
            <Title level={2}>Delete User Card</Title>
            <Paragraph>Press the Student Card ID that need to delete</Paragraph>
            <Divider />


            <Form form={deleteForm} layout="vertical">
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
                    />
                </Form.Item>

                <Divider />
                <Button
                    type='primary'
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
                <Button style={{ marginLeft: '10px' }}
                   icon={<ClearOutlined />}
                    onClick={() => {
                        setCardId('');
                        deleteForm.resetFields(); // This resets all form fields to initial values
                    }}
                    type="primary" danger>
                    Reset
                </Button>
            </Form>
        </Card>
    );
}


export default deleteCard;