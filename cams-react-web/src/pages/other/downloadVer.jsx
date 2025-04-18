import React, { useState } from "react";
import { Button, Divider, Space, Tabs, message, theme, Typography, Select,Card } from "antd";
import { assetService } from "../../api";
import {
  AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WeiboOutlined,
  DownloadOutlined
} from '@ant-design/icons';
const { Title } = Typography;

const downloadVer = () => {

  const [selectedPlatform, setSelectedPlatform] = useState('winx64');
  const [selectedPackage, setSelectedPackage] = useState('zip');



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
   
<div style={{
  position: 'fixed',
  bottom: 600,
  left: 250,
  padding: '20px',
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',  // Light background with slight transparency
  backdropFilter: 'blur(4px)',
  borderRadius: '8px',
  margin: '0 auto',
  width: '500px',
  maxWidth: '500px',
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
  border: '1px solid rgb(0, 0, 0)'  // Very light border
}}>
  <Typography.Title level={5} style={{ color: '#1f1f1f', marginBottom: '16px' }}>
    Download Desktop Version 
  </Typography.Title>

  <Space direction="vertical" style={{ width: '100%' }}>
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Typography.Text style={{ color: '#333333' }}>Platform:</Typography.Text>
      <Select
        value={selectedPlatform}
        onChange={(value) => setSelectedPlatform(value)}
        style={{ width: 200 }}
        options={[
          { value: 'winx64', label: 'Windows' },
          { value: 'mac', label: 'macOS', disabled: true },
          { value: 'linux', label: 'Linux', disabled: true },
        ]}
      />
    </Space>

    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Typography.Text style={{ color: '#333333' }}>Distribution Package:</Typography.Text>
      <Select
        value={selectedPackage}
        onChange={(value) => setSelectedPackage(value)}
        style={{ width: 200 }}
        options={[
          { value: 'zip', label: 'Zip' },
          { value: 'installer', label: 'Installer' },
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

    <Typography.Text style={{ color: '#606060', fontSize: '12px' }}>
      Desktop version provides enhanced features including direct card reader integration.
    </Typography.Text>
  </Space>
</div>
     
 
  );
}

export default downloadVer;