import React from 'react';
import {
  AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WeiboOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Space, Tabs, message, theme, Typography, Select } from 'antd';
import { useState, useEffect } from 'react';
import Video from "../../assets/video/login.mp4"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import camsLogo from "../../assets/images/camslogo.png";
import { assetService } from '../../api';

const iconStyles = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

const {Text} = Typography


const Page = () => {
  const [loginType, setLoginType] = useState('account');
  const [cardId, setCardId] = useState('');
  const [isCardReaderActive, setIsCardReaderActive] = useState(false);
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const [selectedPlatform, setSelectedPlatform] = useState('winx64');
  const [selectedPackage, setSelectedPackage] = useState('zip');

  const { login, loginByCard } = useAuth();

  // Function to handle card ID input from external reader
  useEffect(() => {
    // Only activate the card reader when in card login mode
    if (loginType !== 'card') return;

    // Function to handle keydown events for card reader input
    const handleCardReaderInput = (event) => {
      if (!isCardReaderActive) return;

      // If it's a digit, add it to the cardId state
      if (/^\d$/.test(event.key)) {
        setCardId(prev => {
          const newCardId = prev + event.key;
          // Auto-submit if we've reached 10 digits (common card ID length)
          if (newCardId.length === 10) {
            console.log('Card scan complete, auto-submitting:', newCardId);
            // Use setTimeout to ensure state is updated before submission
            setTimeout(() => handleCardSubmit(newCardId), 100);
          }
          return newCardId;
        });
      }

      // Enter key signals end of card read regardless of length
      if (event.key === 'Enter' && cardId.length > 0) {
        console.log('Card scan complete (Enter pressed), attempting login with:', cardId);
        // Automatically submit the card ID immediately
        handleCardSubmit(cardId);
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleCardReaderInput);

    // Clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleCardReaderInput);
    };
  }, [loginType, isCardReaderActive, cardId]);

  // Auto-focus the card input field when switching to card login
  useEffect(() => {
    if (loginType === 'card') {
      setIsCardReaderActive(true);
      // Clear any previous card ID when switching to card login
      setCardId('');
    }
  }, [loginType]);

  // Function to handle card login submission
  const handleCardSubmit = async (id) => {
    try {
      console.log('Attempting login with card ID:', id);

      // Use the loginByCard method from AuthContext
      const result = await loginByCard(id);

      if (result.success) {
        console.log('Card login successful');
        message.success('Login successful!');

        // Use the redirectPath from the login result
        const redirectTo = result.redirectPath || '/home';
        console.log(`Redirecting to: ${redirectTo}`);
        navigate(redirectTo);
      } else {
        // Handle error from login attempt
        console.log('Card login failed:', result.error);
        const errorMessage = result.error?.description || 'Card login failed - Invalid card';
        message.error(errorMessage);
        // Reset card ID for another attempt
        setCardId('');
      }
    } catch (error) {
      console.error('Card login error:', error);
      message.error('An error occurred during card login. Please try again.');
      setCardId('');
    }
  };

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

  // Update handleDownload function
  const handleDownload = async () => {
    try {
      const result = await assetService.downloadElectronApp(selectedPlatform, selectedPackage);
      if (!result.success) {
        message.error('Failed to download application');
      }
    } catch (error) {
      console.error('Download error:', error);
      message.error('An error occurred while downloading');
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
          if (loginType === 'card') {
            // For card login, always use the cardId from state, not from the form
            if (cardId) {
              await handleCardSubmit(cardId);
            } else {
              message.info('Please scan your card first');
              return false;
            }
          } else {
            // For regular login, use the form values
            await handleSubmit(values);
          }
          return true;
        }}
        submitter={{
          searchConfig: { submitText: 'Login' },
          render: (_, dom) => loginType === 'card' ? null : dom,
          resetButtonProps: { style: { display: 'none' } }, // Hide the reset button
        }}
        activityConfig={{
          style: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 100%)',
            backdropFilter: 'blur(6px)',
            padding: '16px',
            color: token.colorTextHeading,
          } ,
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
          onChange={(activeKey) => {
            setLoginType(activeKey);
            // Reset card ID when changing tabs
            if (activeKey === 'card') {
              setCardId('');
              // Automatically focus on card input when switching to card tab
              setIsCardReaderActive(true);
            } else {
              setIsCardReaderActive(false);
            }
          }}
          items={[
            {
              key: 'account',
              label: 'Account Login',
            },
            {
              key: 'card',
              label: 'Card Login',
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

        {loginType === 'card' && (
          <>
            <ProFormText.Password
              name="cardId"
              hidden={true} // Add this line to hide the field
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
                value: cardId,
                disabled: true, // Field is locked as per requirements
                onFocus: () => setIsCardReaderActive(true),
                onBlur: () => setIsCardReaderActive(false),
              }}
              placeholder={'Please scan your card...'}
              // Make sure the form gets the current cardId value
              initialValue={cardId}
              getValueFromEvent={() => cardId}
            />
            {/* Card login now uses the form's submit button instead of a separate button */}
            <div style={{ textAlign: 'center', fontSize: '12px', color: token.colorTextSecondary }}>
              {isCardReaderActive ?
                `Card reader active - ${cardId ? `Reading Success` : 'waiting for scan...'}` :
                'Click the field to activate card reader'}
            </div>
          </>
        )}
        {loginType === 'account' && (
          /*<div style={{ marginBlockEnd: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              Auto Login
            </ProFormCheckbox>
            <a style={{ float: 'right' }}>Forgot Password</a>
          </div>*/
          <Text type='secondary' style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            display: 'block',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: 20 // Add space below (before the next element)
          }}>Forget Password please find technician</Text>
        )}

      </LoginFormPage>








      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 25,
          padding: '20px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          margin: '0 auto',
          width: '500px',
          maxWidth: '500px',
          zIndex: 1000, // Add high z-index to appear above video
        }}>
        <Typography.Title level={5} style={{ color: 'white', marginBottom: '16px' }}>
          Download Desktop Version <span style={{color: 'skyblue'}}>For Guest</span>
        </Typography.Title>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text style={{ color: 'white' }}>Platform:</Typography.Text>
            <Select
              value={selectedPlatform}
              onChange={(value) => {
              const packageSelection = document.getElementById("package-selection");

              if (value === "android") {
                // hide the package selection for Android
                if (packageSelection) {
                  packageSelection.style.display = "none";
                }
              }else {
                // show the package selection for other platforms
                if (packageSelection) {
                  packageSelection.style.display = "block";
                }
              }
              setSelectedPlatform(value)
            }}
              style={{ width: 200 }}
              options={[
              { value: "winx64", label: "Windows 64-bit" },
              { value: "winx86", label: "Windows 32-bit" },
              { value: "mac", label: "macOS" },
              { value: "linux", label: "Linux" },
              { value: "android", label: "Android" },
            ]}
            />
          </Space>

          <Space style={{ width: '100%', justifyContent: 'space-between' }} id="package-selection">
            <Typography.Text style={{ color: 'white' }}>Distribution Package:</Typography.Text>
            <Select
              value={selectedPackage}
              onChange={(value) => setSelectedPackage(value)}
              style={{ width: 200 }}
              options={[
              { value: "unpacked", label: "Zip" },
              { value: "setup", label: "Installer" },
            ]}
            />
          </Space>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{ width: '100%', marginTop: '10px' }}
            onClick={handleDownload}
          >
            Download Now
          </Button>

          <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
            Desktop version provides enhanced features including direct card reader integration.
          </Typography.Text>
        </Space>
      </div>




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