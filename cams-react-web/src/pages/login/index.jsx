import React from 'react';
import axios from 'axios';
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
import ReactLogo from "../../assets/react.svg"
import {getMenu} from "../../api"
import Video from "../../assets/video/login.mp4"
import { useNavigate } from 'react-router-dom';

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
  
  // Updated to handle CORS and authorization
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8787',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: false // Set to true if server expects cookies
  });

// 修改 handleSubmit
const handleSubmit = async (values) => {
  try {
    // Simplify to core login credentials
    const loginRequest = {
      CNA: values.username,
      password: values.password,
    };
    
    console.log('Attempting login with request:', JSON.stringify(loginRequest));
    
    // Make request to the SpringBoot endpoint with explicit CORS headers
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8787/api/loginbypw',
        data: loginRequest,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: false
      });
      
      // Log full response for debugging
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
    // Check if response is successful - add more conditions based on your API's actual response format
    if (response.data.code === 200 || response.data.success || response.status === 200) {
      // Store auth token if provided by the backend
      if (response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        // Add token to subsequent request headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
          }
      
      // Store user info if provided
      if (response.data.data?.user) {
        localStorage.setItem('userInfo', JSON.stringify(response.data.data.user));
        }
        
      message.success('Login successful!');
        navigate("/home");
      } else {
        // More detailed error logging
        console.log('Login failed with response:', response);
        console.log('Response structure:', {
          status: response.status,
          statusText: response.statusText,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          message: response.data?.message || 'No message'
        });
        
        // Check if there's a specific error message from the server
        if (response.data && response.data.message) {
          message.error(`Server says: ${response.data.message}`);
        } else if (response.data && response.data.error) {
          message.error(`Error: ${response.data.error}`);
        } else {
          message.error('Login failed - Please check your credentials and try again');
        }
      }
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const errorMessage = error.response.data?.message || 
                          `Server error: ${error.response.status}`;
      message.error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      message.error('No response from server. Please check if the server is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      message.error(`Error: ${error.message}`);
    }
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
  logo={ReactLogo}
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
  >
    <Tabs.TabPane key={'account'} tab={'Account Login'} />
  </Tabs>
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