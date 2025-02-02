import React, { useState } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const ManageItem = () => {
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingItem(record);
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
        setItems(items.filter((item) => item.key !== key));
        message.success("Item deleted successfully.");
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        setItems(
          items.map((item) =>
            item.key === editingItem.key ? { ...item, ...values } : item
          )
        );
      } else {
        setItems([...items, { ...values, key: Date.now().toString() }]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Normalize upload file list
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  const columns = [
    { title: "Item Name", dataIndex: "name", key: "name" },
    { title: "Device", dataIndex: "device", key: "device" },
    { title: "Part", dataIndex: "part", key: "part" },
    {
      title: "Document",
      dataIndex: "doc",
      key: "doc",
      render: (doc) =>
        doc && doc.length > 0 ? doc.map((file) => file.name).join(", ") : "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showEditModal(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.key)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Filter items based on searchText
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Manage Item</Title>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={showAddModal}>
            Add Item
          </Button>
          <Search
            placeholder="Search items"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={filteredItems}
          pagination={{ pageSize: 5 }} // 添加分頁，每頁顯示5個項目
        />
      </Card>
      <Modal
        title={editingItem ? "Edit Item" : "Add Item"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: "Please input the item name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="device"
            label="Device"
            rules={[{ required: true, message: "Please input the device name!" }]}
          >
            <Input placeholder="e.g. Device Model X" />
          </Form.Item>
          <Form.Item
            name="part"
            label="Part"
            rules={[{ required: true, message: "Please input the part details!" }]}
          >
            <Input placeholder="e.g. Part A, Part B" />
          </Form.Item>
          <Form.Item
            name="doc"
            label="Document (Optional)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload.Dragger
              name="files"
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              multiple={false}
              beforeUpload={() => false} // Prevent auto upload for manual handling
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag document file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for DOC, PDF, or other document files.
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageItem;