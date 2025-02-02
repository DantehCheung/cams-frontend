import React, { useState } from "react";
import { Card, Form, Input, Button, Table, notification } from "antd";
import "./return.css";

const Return = () => {
  const [returnForm] = Form.useForm();
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    const itemName = returnForm.getFieldValue("returnItem");
    if (itemName) {
      setItems([...items, { key: Date.now(), name: itemName }]);
      returnForm.resetFields(["returnItem"]);
    }
  };

  const handleReturn = () => {
    notification.success({
      message: "Return Completed",
      description: "Item(s) returned successfully. Thank you!",
    });
    setItems([]);
  };

  const columns = [
    { title: "Item", dataIndex: "name", key: "name" },
  ];

  return (
    <div className="return-container">
      <Card title="Return Items (Scan RFID or Add Manually)">
        <Form form={returnForm} layout="inline">
          <Form.Item name="returnItem" label="Item">
            <Input placeholder="Item to return" />
          </Form.Item>
          <Form.Item>
          <Button style={{marginRight:'10px'}}>Scan Item RFID</Button>
            <Button type="primary" onClick={handleAddItem}>
              Add to List
            </Button>
          </Form.Item>
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[{ required: true }]}
          >
            <Input placeholder="Student ID Number" />
          </Form.Item>
          <Form.Item>
            <Button>Scan Student RFID</Button>
          </Form.Item>
        </Form>
        <Table
          columns={columns}
          dataSource={items}
          pagination={false}
          style={{ marginTop: 16 }}
        />
        <Button
          type="primary"
          onClick={handleReturn}
          style={{ marginTop: 16 }}
        >
          Confirm Return
        </Button>
      </Card>
    </div>
  );
};

export default Return;