import React from "react";
import { Typography, Select, Button, Divider, List } from "antd";

const { Title } = Typography;
const data = [
  "Racing car sprays burning fuel into crowd.",
  "Japanese princess to wed commoner.",
  "Australian walks 100km after outback crash.",
  "Man charged over missing wedding girl.",
  "Los Angeles battles huge wildfires.",
];

const connectRFID = () => {
  return (
    <div>
      <form action="">
        <Title level={2}>Connect to RFID Reader</Title>
        <p>
          <label>Connection Type: </label>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Search to Select"
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={[
              {
                value: "1",
                label: "USB",
              },
            ]}
          />
        </p>
        <br />
        <p>
          <label>Avaliable Device: </label>
          <Select
            showSearch
            style={{ width: 500 }}
            placeholder="Search to Select"
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={[
              {
                value: "1",
                label: "",
              },
            ]}
          />
          <Button type="primary" style={{ marginLeft: 10 }}>
            Connect
          </Button>
        </p>
        <br />
        <p>
          <Button type="primary">Execute</Button>
          <Button style={{ marginLeft: 10 }}>Clear</Button>
        </p>
      </form>

      <Divider orientation="left">Result</Divider>
      <List
        size="large"
        header={<div>Header</div>}
        footer={<div>Footer</div>}
        bordered
        dataSource={data}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    </div>
  );
};

export default connectRFID;
