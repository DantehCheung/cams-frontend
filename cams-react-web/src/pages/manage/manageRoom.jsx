import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Table, Space, Modal, Typography, Select, message, Spin } from "antd";
import { assetService } from "../../api";

const { Title } = Typography;

const initialRooms = [];

const ManageRoom = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch campus data from API when component mounts
  useEffect(() => {
    const fetchCampusData = async () => {
      try {
        setLoading(true);
        const response = await assetService.getCampusData();
        
        // Log the entire response for debugging
        console.log('Campus data response:', response);
        
        // Check various possible response formats
        if (response && Array.isArray(response.c)) {
          console.log('Found campus data in response.c format');
          // Format the campus data for the select field
          const formattedCampuses = response.c.map(campus => ({
            key: campus.campusId.toString(),
            fullName: campus.campusName,
            shortName: campus.campusShortName
          }));
          setCampuses(formattedCampuses);
        } else {
          // Fallback if API response format is unexpected
          console.warn('Unexpected API response format:', response);
          setCampuses([]);
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
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    // Format form values to match the form field names
    form.setFieldsValue({
      campus: record.campusId.toString(),
      roomNumber: record.roomNumber,
      roomName: record.name
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this room?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          // Call the API to delete the room
          const roomId = record.roomId;
          console.log('Deleting room with ID:', roomId);
          
          const response = await assetService.deleteRoom(roomId);
          
          if (response.success) {
            message.success('Room deleted successfully');
            
            // Refresh the room list if a campus is selected
            if (selectedCampus) {
              const refreshResponse = await assetService.getRoomsByCampus(selectedCampus);
              if (refreshResponse.success && refreshResponse.data.rooms) {
                const formattedRooms = refreshResponse.data.rooms.map(room => ({
                  key: room.room.toString(),
                  roomId: room.room,
                  campusId: room.campusId,
                  roomNumber: room.roomNumber,
                  name: room.roomName || room.roomNumber
                }));
                setRooms(formattedRooms);
              } else {
                // If refresh fails, just update locally
                setRooms(rooms.filter((room) => room.key !== record.key));
              }
            } else {
              // No campus selected, just update locally
              setRooms(rooms.filter((room) => room.key !== record.key));
            }
          } else {
            message.error(`Failed to delete room: ${response.error?.description || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Delete room error:', error);
          message.error(`Failed to delete room: ${error.message}`);
          
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
        setLoading(true);
        
        if (editingRoom) {
          // Edit existing room
          const roomId = editingRoom.roomId;
          const campusId = values.campus;
          const roomNumber = values.roomNumber;
          const roomName = values.roomName;
          
          console.log('Editing room:', { roomId, campusId, roomNumber, roomName });
          
          const response = await assetService.editRoom(roomId, campusId, roomNumber, roomName);
          
          if (response.success) {
            message.success('Room updated successfully');
            
            // Refresh the room list for the selected campus to get the updated data
            if (selectedCampus === campusId) {
              const refreshResponse = await assetService.getRoomsByCampus(campusId);
              
              if (refreshResponse.success && refreshResponse.data.rooms) {
                const formattedRooms = refreshResponse.data.rooms.map(room => ({
                  key: room.room.toString(),
                  roomId: room.room,
                  campusId: room.campusId,
                  roomNumber: room.roomNumber,
                  name: room.roomName || room.roomNumber
                }));
                
                setRooms(formattedRooms);
              } else {
                // If refresh fails, just update locally
                setRooms(rooms.map(room => {
                  if (room.key === editingRoom.key) {
                    return {
                      ...room,
                      campusId: campusId,
                      roomNumber: roomNumber,
                      name: roomName
                    };
                  }
                  return room;
                }));
              }
            }
          } else {
            message.error(`Failed to update room: ${response.error?.description || 'Unknown error'}`);
            return; // Don't close modal or reset form if there was an error
          }
        } else {
          // Add new room
          const campusId = values.campus;
          const roomNumber = values.roomNumber;
          const roomName = values.roomName;
          
          console.log('Adding new room:', { campusId, roomNumber, roomName });
          
          const response = await assetService.addRoom(campusId, roomNumber, roomName);
          
          if (response.success) {
            message.success('Room added successfully');
            
            // Refresh the room list for the selected campus to get the updated data
            if (selectedCampus === campusId) {
              const refreshResponse = await assetService.getRoomsByCampus(campusId);
              
              if (refreshResponse.success && refreshResponse.data.rooms) {
                const formattedRooms = refreshResponse.data.rooms.map(room => ({
                  key: room.room.toString(),
                  roomId: room.room,
                  campusId: room.campusId,
                  roomNumber: room.roomNumber,
                  name: room.roomName || room.roomNumber
                }));
                
                setRooms(formattedRooms);
              } else {
                // If refresh fails, just add locally with temporary data
                const newRoom = {
                  key: Date.now().toString(),
                  campusId: campusId,
                  roomNumber: roomNumber,
                  name: roomName
                };
                setRooms([...rooms, newRoom]);
              }
            }
          } else {
            message.error(`Failed to add room: Repeated RoomID ${response.error?.description || 'Unknown error'}`);
            return; // Don't close modal or reset form if there was an error
          }
        }
        
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error('Failed to save room:', error);
        message.error(`Failed to save room: ${error.message}`);
      } finally {
        setLoading(false);
      }
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

  const handleSort = async () => {
    if (!selectedCampus) {
      message.warning('Please select a campus first');
      return;
    }
    
    try {
      setLoading(true);
      // Call the API to get rooms for the selected campus
      const response = await assetService.getRoomsByCampus(selectedCampus);
      
      if (response.success && response.data.rooms) {
        // Format the rooms data for the table
        const formattedRooms = response.data.rooms.map(room => ({
          key: room.room.toString(),
          roomId: room.room,
          campusId: room.campusId,
          roomNumber: room.roomNumber,
          name: room.roomName || room.roomNumber // Use roomName if available, fallback to roomNumber
        }));
        
        setRooms(formattedRooms);
        message.success(`Loaded ${formattedRooms.length} rooms from selected campus`);
      } else {
        message.error(`Failed to load rooms: ${response.error?.description || 'Unknown error'}`);
        setRooms([]);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      message.error(`Failed to load rooms: ${error.message}`);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Room Number', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: 'Room Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record)}>Delete</Button>
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
            loading={loading}
          >
            {campuses.map(campus => (
              <Select.Option key={campus.key} value={campus.key}>
                {campus.shortName}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSort}>
            Select
          </Button>
          <Button type="primary" onClick={handleAdd}>
            Add Room
          </Button>
        </Space>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table columns={columns} dataSource={rooms} />
        )}
      </Card>
      <Modal
        title={editingRoom ? "Edit Room" : "Add Room"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Campus" name="campus"
           rules={[{ required: true, message: 'Please choose a campus!' }]}>
          <Select
            placeholder="Select Campus"
            style={{ width: '100%' }}
            loading={loading}
          >
            {campuses.map(campus => (
              <Select.Option key={campus.key} value={campus.key}>
                {campus.shortName}
              </Select.Option>
            ))}
          </Select>
          </Form.Item>
       
          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[{ required: true, message: 'Please input the room number!' }]}
          >
            <Input placeholder="e.g. 348" />
          </Form.Item>
          
          <Form.Item
            name="roomName"
            label="Room Name"
            rules={[{ required: true, message: 'Please input the room name!' }]}
          >
            <Input placeholder="e.g. Computer Lab" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageRoom;