import React, { useState } from 'react';
import { PageContainer, ProCard, ProField } from '@ant-design/pro-components';
import { Avatar, Descriptions, Space, Radio, Switch, Button, Upload, message, Card, Divider, Form, Input, notification, Typography } from 'antd';
import { UploadOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { assetService } from '../../api';

const { Title, Paragraph, Text } = Typography;

const UserInfo = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      
      // Validate form fields
      const values = await form.validateFields();
      
      // Check if new passwords match
      if (values.newPassword !== values.confirmPassword) {
        notification.error({
          message: 'Password Error',
          description: 'New passwords do not match.',
        });
        return;
      }
      
      // Send request to API
      const result = await assetService.changePassword(
       values
      );
      
      if (result.data && result.data.status === true) {
        notification.success({
          message: 'Password Changed',
          description: 'Your password has been successfully updated.',
        });
        form.resetFields();
      } else {
        notification.error({
          message: 'Change Failed',
          description: result.data?.message || 'Failed to change password. Please try again.',
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while changing your password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title level={2}>Change Your Password</Title>
      <Paragraph>Fill in the form below to change your password</Paragraph>
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        requiredMark={true}
      >
        <Form.Item
          name="oldPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Enter your current password" 
          />
        </Form.Item>
        
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 8, message: 'Password must be at least 8 characters long' }
          ]}
        >
          <Input.Password 
            prefix={<KeyOutlined />} 
            placeholder="Enter your new password" 
          />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<KeyOutlined />} 
            placeholder="Confirm your new password" 
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleChangePassword} 
            loading={loading}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserInfo;