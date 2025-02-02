import React, { useState } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, Select } from "antd";

const { Title } = Typography;

const initialRooms = [
  { key: '1', name: '348' },
  { key: '2', name: '349' },
  { key: '3', name: '350' },
];

const ManageRoom = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();
  const [selectedCampus, setSelectedCampus] = useState(null);

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        setRooms(rooms.filter((room) => room.key !== key));
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

  const handleCampusChange = (value) => {
    setSelectedCampus(value);
    // TODO: filter or update rooms based on selected campus if needed
  };

  const handleSort = () => {
    //...
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
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select Campus"
            style={{ width: 150 }}
            onChange={handleCampusChange}
            value={selectedCampus}
          >
            <Select.Option value="">Chai Wan</Select.Option>
            <Select.Option value="">Haking Wong</Select.Option>
            <Select.Option value="">Kwai Chung</Select.Option>
            <Select.Option value="">Kwun Tong</Select.Option>
            <Select.Option value="">Lee Wai Lee</Select.Option>
            <Select.Option value="">Morrison Hill</Select.Option>
            <Select.Option value="">Sha Tin</Select.Option>
            <Select.Option value="">Tsing Yi</Select.Option>
            <Select.Option value="">Tuen Mun</Select.Option>
          </Select>
          <Button type="primary" onClick={handleSort}>
            Select
          </Button>
          <Button type="primary" onClick={handleAdd}>
            Add Room
          </Button>
        </Space>
        <Table columns={columns} dataSource={rooms} />
      </Card>
      <Modal
        title={editingRoom ? "Edit Room" : "Add Room"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Campus" name="campus"
           rules={[{ required: true, message: 'Please choose a campus!' }]}>
          <Select
            placeholder="Select Campus"
            style={{ width: 150 }}
          >
            <Select.Option value="">Chai Wan</Select.Option>
            <Select.Option value="">Haking Wong</Select.Option>
            <Select.Option value="">Kwai Chung</Select.Option>
            <Select.Option value="">Kwun Tong</Select.Option>
            <Select.Option value="">Lee Wai Lee</Select.Option>
            <Select.Option value="">Morrison Hill</Select.Option>
            <Select.Option value="">Sha Tin</Select.Option>
            <Select.Option value="">Tsing Yi</Select.Option>
            <Select.Option value="">Tuen Mun</Select.Option>
          </Select>
          </Form.Item>
       
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