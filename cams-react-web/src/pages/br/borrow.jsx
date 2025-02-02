import React, { useState } from "react";
import { Card, Form, Input, Button, DatePicker, Table, notification } from "antd";
import "./borrow.css";

const { RangePicker } = DatePicker;

const Borrow = () => {
  const [reservationForm] = Form.useForm();
  const [borrowForm] = Form.useForm();
  const [items, setItems] = useState([]);

  const handleReserve = (values) => {
    notification.success({
      message: "Reservation Success",
      description: `You have reserved "${values.item}". Please complete the on-site borrowing within three days.`,
    });
    reservationForm.resetFields();
  };

  const handleAddItem = () => {
    const itemName = borrowForm.getFieldValue("borrowItem");
    if (itemName) {
      setItems([...items, { key: Date.now(), name: itemName }]);
      borrowForm.resetFields(["borrowItem"]);
    }
  };

  const handleBorrow = () => {
    notification.success({
      message: "Borrowing Completed",
      description: "Item(s) borrowed successfully. A confirmation email has been sent.",
    });
    setItems([]);
  };

  const columns = [
    { title: "Item", dataIndex: "name", key: "name" },
  ];

  return (
    <div className="borrow-container">
      <Card title="Reservations (Please complete on-site borrowing within three days)">
        <Form form={reservationForm} layout="inline" onFinish={handleReserve}>
          <Form.Item
            name="item"
            label="Item"
            rules={[{ required: true }]}
          >
            <Input placeholder="Item Name" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Reservation Date"
            rules={[{ required: true }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Reserve</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Borrow Items (Multiple items allowed)">
        <Form form={borrowForm} layout="inline">
          <Form.Item name="borrowItem" label="Item">
            <Input placeholder="Item to borrow" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleAddItem}>Add to List</Button>
          </Form.Item>
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[{ required: true }]}
          >
            <Input placeholder="Student ID Number" />
          </Form.Item>
          <Form.Item>
            <Button>Scan RFID</Button>
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
          onClick={handleBorrow}
          style={{ marginTop: 16 }}
        >
          Confirm Borrow
        </Button>
      </Card>
    </div>
  );
};

export default Borrow;