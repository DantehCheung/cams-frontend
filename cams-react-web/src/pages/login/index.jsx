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
import ReactLogo from "../../assets/react.svg"
import {getMenu} from "../../api"

const iconStyles = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

const Page = () => {
  const [loginType, setLoginType] = useState('account');
  const { token } = theme.useToken();

  const handleSubmit = async (values) => {
    console.log('Username:', values.username);
    console.log('Password:', values.password);
    // 在此處加入你的登入邏輯
    if (!values.password || !values.username) {
      return message.open({
        type: 'warning',
        content: 'Please enter your username and password',
      });
    }
    getMenu(values).then(({ data }) => {
      console.log(values)
      console.log(data);
    });
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
  backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
  title="CRMS"
  containerStyle={{
    backgroundColor: 'rgba(0, 0, 0,0.65)',
    backdropFilter: 'blur(4px)',
  }}
  subTitle="Campus Resource Management System"
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
    title: 'Event Title (Image Configurable)',
    subTitle: 'Event description and details',
    action: (
      <Button
        size="large"
        style={{
          borderRadius: 20,
          background: token.colorBgElevated,
          color: token.colorPrimary,
          width: 120,
        }}
      >
        Learn More
      </Button>
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