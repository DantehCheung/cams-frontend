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

        }
      } catch (error) {
        console.error('Failed to fetch campus data:', error);
        message.error('Failed to load campus data');
        setCampuses([]); // Set empty array if fetch fails
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
      onOk: async () => {
        try {
          setLoading(true);
          // Call the API to delete the campus
          const campusId = key;
          console.log('Deleting campus with ID:', campusId);
          
          const response = await assetService.deleteCampus(campusId);
          
          if (response.success) {
            message.success('Campus deleted successfully');
            
            // Refresh the campus list to get the updated data
            const refreshResponse = await assetService.getCampusData();
            if (refreshResponse && Array.isArray(refreshResponse.c)) {
              const formattedCampuses = refreshResponse.c.map(campus => ({
                key: campus.campusId.toString(),
                fullName: campus.campusName,
                shortName: campus.campusShortName
              }));
              setCampuses(formattedCampuses);
            } else {
              // If refresh fails, just update locally
              setCampuses(campuses.filter((campus) => campus.key !== key));
            }
          } else {
            message.error(`Failed to delete campus: ${response.error?.description || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Delete campus error:', error);
          message.error(`Failed to delete campus: ${error.message}`);
          
          // No local state changes on error
        } finally {
          setLoading(false);
        }
      },
    }).catch((info) => {
        console.log('Delete Failed:', info);
    });
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editingCampus) {
          // Call API to edit existing campus
          const campusId = editingCampus.key;
          const campusName = values.fullName;
          const campusShortName = values.shortName;
          
          console.log('Editing campus:', { campusId, campusName, campusShortName });
          const response = await assetService.editCampus(campusId, campusName, campusShortName);
          
          if (response.success) {
            // Refresh the campus list to get the updated data
            const refreshResponse = await assetService.getCampusData();
            if (refreshResponse && Array.isArray(refreshResponse.c)) {
              const formattedCampuses = refreshResponse.c.map(campus => ({
                key: campus.campusId.toString(),
                fullName: campus.campusName,
                shortName: campus.campusShortName
              }));
              setCampuses(formattedCampuses);
            } else {
              // If refresh fails, just update locally
              setCampuses(campuses.map((campus) => 
                campus.key === editingCampus.key ? { ...campus, ...values } : campus
              ));
            }
            message.success('Campus updated successfully');
          } else {
            message.error(`Failed to update campus: ${response.error?.description || 'Unknown error'}`);
            return; // Don't close modal or reset form if there was an error
          }
        } else {
          // Call the API to add a new campus
          const campusName = values.fullName;
          const campusShortName = values.shortName;
          
          console.log('Adding new campus:', { campusName, campusShortName });
          const response = await assetService.addCampus(campusName, campusShortName);
          
          if (response.success) {
            // Refresh the campus list to get the updated data with correct IDs from backend
            const refreshResponse = await assetService.getCampusData();
            if (refreshResponse && Array.isArray(refreshResponse.c)) {
              const formattedCampuses = refreshResponse.c.map(campus => ({
                key: campus.campusId.toString(),
                fullName: campus.campusName,
                shortName: campus.campusShortName
              }));
              setCampuses(formattedCampuses);
            } else {
              // If refresh fails, just add locally with temporary key
              setCampuses([...campuses, { ...values, key: Date.now().toString() }]);
            }
            message.success('Campus added successfully');
          } else {
            message.error(`Failed to add campus: ${response.error?.description || 'Unknown error'}`);
            return; // Don't close modal or reset form if there was an error
          }
        }
        
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error('Failed to save campus:', error);
        message.error(`Failed to save campus: ${error.message}`);
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