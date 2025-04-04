import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, message, Spin } from "antd";
import { assetService } from "../../api";

const { Title } = Typography;


const ManageCampus = () => {
  const [campuses, setCampuses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  // Fetch campus data from API when component mounts
  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        setLoading(true);
        const response = await assetService.getCampusData();
        
        // Log the entire response for debugging
        console.log('Full response in component:', response);
        
        // Check various possible response formats
        if (response && Array.isArray(response.c)) {
          console.log('Found response.c array format');
          // Format 1: { c: [...] }
          const formattedCampuses = response.c.map(campus => ({
            key: campus.campusId.toString(),
            fullName: campus.campusName,
            shortName: campus.campusShortName
          }));
          setCampuses(formattedCampuses);      
       
        } else {
          // Fallback to initialCampuses if API response format is unexpected
          console.warn('Unexpected API response format:', response);
          setCampuses(initialCampuses);
        }
      } catch (error) {
        console.error('Failed to fetch campus data:', error);
        message.error('Failed to load campus data');
        setCampuses(initialCampuses); // Use initial data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCampusData();
  }, []);

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
    form.validateFields().then(async (values) => {
      try {
        // Here you would typically call an API to save the changes
        // const saveResponse = await assetService.saveCampus(values);
        
        // For now, we'll just update the local state
        if (editingCampus) {
          setCampuses(campuses.map((campus) => 
            campus.key === editingCampus.key ? { ...campus, ...values } : campus
          ));
          message.success('Campus updated successfully');
        } else {
          setCampuses([...campuses, { ...values, key: Date.now().toString() }]);
          message.success('Campus added successfully');
        }
        
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error('Failed to save campus:', error);
        message.error('Failed to save campus');
      }
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName' },
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table columns={columns} dataSource={campuses} />
        )}
      </Card>
      <Modal
        title={editingCampus ? "Edit Campus" : "Add Campus"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full campus name!' }]}
          >
            <Input placeholder="e.g. Chai Wan Campus" />
          </Form.Item>
          <Form.Item
            name="shortName"
            label="Short Name"
            rules={[{ required: true, message: 'Please input the campus short name!' }]}
          >
            <Input placeholder="e.g. CW" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCampus;