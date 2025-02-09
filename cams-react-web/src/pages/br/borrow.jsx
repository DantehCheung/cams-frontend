import React, { useState } from "react";
import { Card, Form, Input, Button, DatePicker, Table, notification } from "antd";
import "./borrow.css"; // css file
// insert react redux hooks
import { useSelector, useDispatch } from "react-redux";
import { borrowSuccess } from "../../store/modules/borrowSlice";

const { RangePicker } = DatePicker;

const Borrow = () => {
  const [reservationForm] = Form.useForm();
  const [borrowForm] = Form.useForm();
  /* const [items, setItems] = useState([]); replace by redux store*/
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.borrow)

  const handleReserve = (values) => {
    notification.success({
      message: "Reservation Success",
      description: `You have reserved "${values.item}". Please complete the on-site borrowing within three days.`,
    });
    reservationForm.resetFields();
  };

  const handleAddItem = () => {
    const itemName = borrowForm.getFieldValue("borrowItem");
    const studentId = borrowForm.getFieldValue("studentId");
    if (studentId==null || studentId=="" || itemName==null || itemName=="") {
      notification.error({
        message: "Borrowing Failed",
        description: "Please enter a Student ID or Item ID.",
      });
      return;
    }
    if (itemName) {
      dispatch(borrowSuccess([...items, { key: Date.now(), name: itemName }]));
      borrowForm.resetFields(["borrowItem"]);
    }
  };

  const handleBorrow = async () => {
    try {
      
      /** 
       * Real API
       * const response = await fetch('/api/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json(); */


      // api call here
      // if async success return resolve, if fail return 
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve(items), 1000)
      );
      // in this case items is [], thats why can empty this table
      dispatch(borrowSuccess([]));

      notification.success({
        message: "Borrowing Completed",
        description: "Item(s) borrowed successfully. A confirmation email has been sent.",
      });
    } catch (error) {
      dispatch(borrowFailure(error));
      notification.error({
        message: "Borrowing Failed",
        description: error.toString(),
      });
    }
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
            <Button style={{ marginRight: '10px' }}>Scan Item RFID</Button>
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