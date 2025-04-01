import React, { useState } from "react";
import { Card, Form, Input, Button, DatePicker, Table, notification, Select, Row, Col } from "antd";
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

        <Form.Item label="Room" name="room"
                     rules={[{ required: true, message: 'Please choose a room!' }]}>
                    <Select
                      placeholder="Select Room"
                      style={{ width: 150 }}
                    >
                      
                      <Select.Option value="">ROOM 348</Select.Option>
                      <Select.Option value="">ROOM 349</Select.Option>
                      <Select.Option value="">ROOM 350</Select.Option>
                    </Select>
                    </Form.Item>
                 
        
          <Form.Item label="Item" name="item"
                     rules={[{ required: true, message: 'Please choose a item!' }]}>
                    <Select
                      placeholder="Select Item"
                      style={{ width: 150 }}
                    >
                      
                      <Select.Option value="">spider</Select.Option>
                      <Select.Option value="">dog</Select.Option>
                      <Select.Option value="">robot car</Select.Option>
                    </Select>
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
      <Form form={borrowForm} layout="vertical">
    <Row gutter={16}>
        <Col span={6}>
            <Form.Item 
                label="Room" 
                name="room"
                rules={[{ required: true, message: 'Please choose a room!' }]}
            >
                <Select placeholder="Select Room">
                    <Select.Option value="ROOM348">ROOM 348</Select.Option>
                    <Select.Option value="ROOM349">ROOM 349</Select.Option>
                    <Select.Option value="ROOM350">ROOM 350</Select.Option>
                </Select>
            </Form.Item>
        </Col>
        <Col span={6}>
            <Form.Item 
                label="Item" 
                name="item"
                rules={[{ required: true, message: 'Please choose an item!' }]}
            >
                <Select placeholder="Select Item">
                    <Select.Option value="spider">spider</Select.Option>
                    <Select.Option value="dog">dog</Select.Option>
                    <Select.Option value="robotcar">robot car</Select.Option>
                </Select>
            </Form.Item>
        </Col>
        <Col span={6}>
            <Form.Item 
                label="Student ID" 
                name="studentId"
                rules={[{ required: true, message: 'Please enter your Student ID!' }]}
            >
                <Input placeholder="Student ID Number" />
            </Form.Item>
        </Col>
    </Row>

    <Row gutter={16}>
        <Col span={8}>
            <Form.Item>
                <Button block style={{ marginBottom: 8 }}>Scan Item RFID</Button>
            </Form.Item>
        </Col>
        <Col span={8}>
            <Form.Item>
                <Button block type="primary" onClick={handleAddItem} style={{ marginBottom: 8 }}>
                    Add to List
                </Button>
            </Form.Item>
        </Col>
        <Col span={8}>
            <Form.Item>
                <Button block>Scan Student RFID</Button>
            </Form.Item>
        </Col>
    </Row>
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