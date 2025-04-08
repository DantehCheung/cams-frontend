import React from 'react';
import {
  AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WeiboOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Space, Tabs, message, theme } from 'antd';
import { useState } from 'react';
import Video from "../../assets/video/login.mp4"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import camsLogo from "../../assets/images/camslogo.png";

const iconStyles = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

const Page = () => {
  const [loginType, setLoginType] = useState('account');
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      console.log('Attempting login with credentials:', values);
      
      // Use secure AuthContext login method instead of directly calling API
      const result = await login({
        CNA: values.username,
        password: values.password
      });
      
      if (result.success) {
        console.log('Login successful');
        message.success('Login successful!');
        
        // Use the redirectPath from the login result (students go to borrow page, others to home)
        const redirectTo = result.redirectPath || '/home';
        console.log(`Redirecting to: ${redirectTo}`);
        navigate(redirectTo);
      } else {
        // Handle error from login attempt
        console.log('Login failed:', result.error);
        const errorMessage = result.error?.description || 'Login failed - Please check your credentials and try again';
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('An error occurred during login. Please try again later.');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
  
  <LoginFormPage
    logo={camsLogo}
    backgroundVideoUrl={Video}
    title="CAMS"
    containerStyle={{
      backgroundColor: 'rgba(0, 0, 0,0.65)',
      backdropFilter: 'blur(4px)',
    }}
    subTitle="Campus Asset Management System"
    onFinish={async (values) => {
      await handleSubmit(values);
      return true;
    }}
    submitter={{
      searchConfig: { submitText: 'Login' },
    }}
    activityConfig={{
      style: {
        boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
        color: token.colorTextHeading,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(4px)',
      },
      title: 'Campus Asset Management System',
      action: (
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: 20,
        }}
      >
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
        </span>
      </div>
      ),
    }}
    actions={
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Other actions can be added here */}
      </div>
    }
  >
  <Tabs
  centered
  activeKey={loginType}
  onChange={(activeKey) => setLoginType(activeKey)}
  items={[
    {
      key: 'account',
      label: 'Account Login',
    },
  ]}
/>

    {loginType === 'account' && (
      <>
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: (
              <UserOutlined
                style={{
                  color: token.colorText,
                }}
                className={'prefixIcon'}
              />
            ),
          }}
          placeholder={'Username: admin or user'}
          rules={[
            {
              required: true,
              message: 'Please enter your username!',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: (
              <LockOutlined
                style={{
                  color: token.colorText,
                }}
                className={'prefixIcon'}
              />
            ),
          }}
          placeholder={'Password'}
          rules={[
            {
              required: true,
              message: 'Please enter your password!',
            },
          ]}
        />
      </>
    )}
    <div style={{ marginBlockEnd: 24 }}>
      <ProFormCheckbox noStyle name="autoLogin">
        Auto Login
      </ProFormCheckbox>
      <a style={{ float: 'right' }}>Forgot Password</a>
    </div>
  </LoginFormPage>
  </div>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>  
      <Page />
    </ProConfigProvider>
  );
};