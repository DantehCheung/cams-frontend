import React, { useState } from 'react';
import { PageContainer, ProCard, ProField } from '@ant-design/pro-components';
import { Avatar, Descriptions, Space, Radio, Switch, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UserInfo = () => {
  const [mode, setMode] = useState('read'); // 'read' or 'edit'
  const [plain, setPlain] = useState(false);

  // Example user state.
  const [user, setUser] = useState({
    name: 'Ken Lau',
    email: 'kenlau@example.com',
    department: 'IT',
    role: 'Admin',
    photo: 'https://via.placeholder.com/150',
  });

  // Update user field value.
  const handleFieldChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  // Custom upload function: read file as base64 and update photo.
  const customUpload = async ({ file, onSuccess, onError }) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      handleFieldChange('photo', reader.result);
      onSuccess("ok");
      message.success(`${file.name} uploaded successfully.`);
    };
    reader.onerror = (error) => {
      onError(error);
      message.error(`${file.name} upload failed.`);
    };
  };

  return (
    <PageContainer
      title="User Center"
      content="Manage your personal settings and account details."
    >
      <Space style={{ marginBottom: 16 }}>
        <Radio.Group onChange={(e) => setMode(e.target.value)} value={mode}>
          <Radio value="read">Read</Radio>
          <Radio value="edit">Edit</Radio>
        </Radio.Group>
        Lightning Mode
        <Switch checked={plain} onChange={(checked) => setPlain(checked)} />
      </Space>

      <ProCard title="Profile Details" bordered headerBordered style={{ marginBottom: 16 }}>
        {/* Avatar Section */}
        {mode === 'edit' ? (
          <Space direction="vertical">
            <Avatar size={64} src={user.photo || undefined}>
              {user.name.charAt(0)}
            </Avatar>
            <Upload customRequest={customUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Change Avatar</Button>
            </Upload>
          </Space>
        ) : (
          <Avatar size={64} style={{ marginBottom: 16 }} src={user.photo || undefined}>
            {user.name.charAt(0)}
          </Avatar>
        )}

        <Descriptions column={1}>
          <Descriptions.Item label="Name">
            <ProField
              text={user.name}
              mode={mode}
              fieldProps={{
                onChange: (e) => handleFieldChange('name', e.target.value),
                value: user.name,
              }}
              valueType="text"
              plain={plain}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <ProField
              text={user.email}
              mode={mode}
              fieldProps={{
                onChange: (e) => handleFieldChange('email', e.target.value),
                value: user.email,
              }}
              valueType="text"
              plain={plain}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            <ProField
              text={user.department}
              mode={mode}
              fieldProps={{
                onChange: (e) => handleFieldChange('department', e.target.value),
                value: user.department,
              }}
              valueType="text"
              plain={plain}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Password">
            <ProField
              text={user.password}
              mode={mode}
              fieldProps={{
                onChange: (e) => handleFieldChange('password', e.target.value),
                value: user.password,
              }}
              valueType="password"
              plain={plain}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            Admin
          </Descriptions.Item>
        </Descriptions>
        {mode === 'edit' && (
          <Button style={{ marginTop: 16 }} type="primary" onClick={() => console.log('Save user:', user)}>
            Save Changes
          </Button>
        )}
      </ProCard>
    </PageContainer>
  );
};

export default UserInfo;