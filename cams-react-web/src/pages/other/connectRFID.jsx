import React from "react";
import { Typography, Select, Button, Divider, List, Form, Row, Col, Card } from "antd";
import RFID from "../../components/commonRFID/RFID";

const { Title } = Typography;
const data = ["test", "test.", "test", "test.", "test"];




const ConnectRFID = () => {
  return (
    <>
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
                    (optionA?.label ?? "").toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  options={[
                    { value: "1", label: "USB" },
                    { value: "2", label: "Ethernet" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Avaliable Device">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Select
                    showSearch
                    style={{ flex: 1 }}
                    placeholder="Search to Select"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "").toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={[
                      { value: "device1", label: "Device 1" },
                      { value: "device2", label: "Device 2" },
                    ]}
                  />
                  <Button type="primary" style={{ marginLeft: 10 }}>
                    Connect
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Button type="primary">Execute</Button>
              <Button style={{ marginLeft: 10 }}>Clear</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Divider />

      <Card title="Result">
        <List
          size="large"
          bordered
          dataSource={data}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
        <Button type="primary" danger style={{ marginTop: "20px" }}>
          Disconnect
        </Button>
      </Card>
     
    </div>
    <RFID/>
    </>

  );
};

export default ConnectRFID;