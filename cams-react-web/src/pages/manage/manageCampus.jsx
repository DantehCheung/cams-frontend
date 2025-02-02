import React, { useState } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography } from "antd";

const { Title } = Typography;

const initialCampuses = [
  { key: '1', name: 'Chai Wan' },
  { key: '2', name: 'Haking Wong' },
  { key: '3', name: 'Kwai Chung' },
  { key: '4', name: 'Kwun Tong' },
  { key: '5', name: 'Lee Wai Lee' },
  { key: '6', name: 'Morrison Hill' },
  { key: '7', name: 'Sha Tin' },
  { key: '8', name: 'Tsing Yi' },
  { key: '9', name: 'Tuen Mun' },
];

const ManageCampus = () => {
  const [campuses, setCampuses] = useState(initialCampuses);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCampus(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCampus(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: "Are you sure you want to delete this campus?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        setCampuses(campuses.filter((campus) => campus.key !== key));
      },
    }).catch((info) => {
        console.log('Delete Failed:', info);
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingCampus) {
        setCampuses(campuses.map((campus) => (campus.key === editingCampus.key ? { ...campus, ...values } : campus)));
      } else {
        setCampuses([...campuses, { ...values, key: Date.now().toString() }]);
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
    { title: 'Campus Name', dataIndex: 'name', key: 'name' },
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
        <Title level={2}>Manage Campus</Title>
        <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
          Add Campus
        </Button>
        <Table columns={columns} dataSource={campuses} />
      </Card>
      <Modal
        title={editingCampus ? "Edit Campus" : "Add Campus"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Campus Name"
            rules={[{ required: true, message: 'Please input the campus name!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCampus;