import React, { useState } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, message } from "antd";

const { Title } = Typography;

const initialRooms = [
  { key: '1', name: 'RM348' },
  { key: '2', name: 'RM349' },
  { key: '3', name: 'RM350' },
];

const ManageRoom = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRoom(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Are you sure you want to delete this room?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        setRooms(rooms.filter((room) => room.key !== key));
        message.success("Room deleted successfully.");
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingRoom) {
        setRooms(rooms.map((room) => (room.key === editingRoom.key ? { ...room, ...values } : room)));
      } else {
        setRooms([...rooms, { ...values, key: Date.now().toString() }]);
      }
      setIsModalVisible(false);
      form.resetFields();
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: 'Room Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.key)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Manage Room</Title>
        <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
          Add Room
        </Button>
        <Table columns={columns} dataSource={rooms} />
      </Card>
      <Modal
        title={editingRoom ? "Edit Room" : "Add Room"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Room Name"
            rules={[{ required: true, message: 'Please input the room name!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageRoom;