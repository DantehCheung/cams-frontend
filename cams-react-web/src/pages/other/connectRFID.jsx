// filepath: /Users/dantehcheung/fyp/react-vite/cams-react-web/src/pages/other/connectRFID.jsx
import React from "react";
import { Typography, Select, Button, Divider, List, Form, Row, Col, Card } from "antd";
import RFID from "../../components/commonRFID/RFID";

const { Title } = Typography;

const ConnectRFID = () => {
  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Connect to RFID Reader</Title>
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Connection Type">
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Search to Select"
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  options={[
                    { value: "1", label: "USB" },
                    { value: "2", label: "Ethernet" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Available Device">
                <Select style={{ width: "100%" }} placeholder="Select Device" />
              </Form.Item>
            </Col>
          </Row>
          {/* 顯示 RFID 元件 */}
          <Divider />
          <RFID />
        </Form>
      </Card>
    </div>
  );
};

export default ConnectRFID;