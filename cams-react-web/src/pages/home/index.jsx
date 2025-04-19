import React, { useEffect, useState } from "react";
import { Col, Row, Card, Table, Tag } from "antd";
import "./home.css";
import userImg from "../../assets/images/cat.png";
import {  assetService } from "../../api";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const [tableData, setTableData] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [pendingItems, setPendingItems] = useState([]);

  // Function to get the access level name from numeric value
  const getAccessLevelName = (level) => {
    switch (level) {
      case 0: return "Administrator";
      case 10000: return "Guest";
      case 1000: return "Student";
      case 100: return "Teacher/Technician";
      default: return "Unknown";
    }
  };
  const getAccessPageNames = (pageBitmask, userLevel) => {
    if (!pageBitmask) return [];
    
    const pagePermissions = [
      { bit: 63487, name: "Home" },
      { bit: 1540, name: "Borrow" },
      { bit: 1540, name: "Return" },
      {bit: 65535, name: "Check Return", minLevel: 100} , // Teacher and Admin
      { bit: 65535, name: "User Management", minLevel: 0 },      // Admin only
      { bit: 63487, name: "Campus Management", minLevel: 100 },   // Teacher and Admin
      { bit: 63487, name: "Room Management", minLevel: 100 },   // Teacher and Admin
      { bit: 63487, name: "Item Management", minLevel: 100 },   // Teacher and Admin
      { bit: 63487, name: "Reports", minLevel: 100 },          // Teacher and Admin
      { bit: 1540, name: "RFID Connection", minLevel: 1000 }, // All            
      { bit: 1540, name: "Change Password" , minLevel: 1000} // All
    ];
    
    // Filter pages based on both the bitmask AND the user's access level
    return pagePermissions
      .filter(page => 
        (pageBitmask & page.bit) === page.bit && // Check if bit is set in bitmask
        (!page.minLevel || userLevel <= page.minLevel) // Check if user has required access level
      )
      .map(page => page.name);
  };

  // Column configuration
  const columns = [
    { title: 'Campus', dataIndex: 'campus', key: 'campus', width: 100 },
    { title: 'Item', dataIndex: 'item', key: 'item', width: 120 },
    { title: 'Part', dataIndex: 'part', key: 'part', width: 100 },
    { title: 'Price', dataIndex: 'price', key: 'price', render: text => `$${text.toFixed(2)}`, width: 90 },
    { title: 'Purchase Date', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 120 },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 90 },
    { title: 'Room', dataIndex: 'room', key: 'room', width: 100 },
    { title: 'Unique ID', dataIndex: 'uniqueId', key: 'uniqueId', width: 150 },
  ];

  // Get authentication state from context
  const { getUserInfo, getAccessLevel, getAccessPage } = useAuth();
  
  useEffect(() => {
    // Get user info from AuthContext instead of localStorage
    const storedUserInfo = getUserInfo() || {};
    setUserInfo(storedUserInfo);
    
    const fetchData = async () => {
      try {
        
        // Try to fetch home data including pending items
        try {
          const homeData = await assetService.getHomeData();
          console.log("Home data received:", homeData);
          
          // Update user info if needed
          if (homeData && (homeData.lastLoginTime || homeData.lastLoginPlace)) {
            const updatedInfo = {...storedUserInfo};
            if (homeData.lastLoginTime) updatedInfo.lastLoginTime = homeData.lastLoginTime;
            if (homeData.lastLoginPlace) updatedInfo.lastLoginIp = homeData.lastLoginPlace;
            setUserInfo(updatedInfo);
          }
          
          // Set pending confirmation items
          if (homeData && homeData.pendingConfirmItem && Array.isArray(homeData.pendingConfirmItem)) {
            setPendingItems(homeData.pendingConfirmItem);
            console.log("Pending confirmation items:", homeData.pendingConfirmItem);
          }
        } catch (homeError) {
          console.warn("Unable to fetch home data:", homeError);
        }
      } catch (error) {
        console.error("Fetch data error:", error);
      }
    };
    // Add a short delay before making API calls to ensure backend session is ready
    setTimeout(() => {
      console.log('Initiating API calls after delay');
      fetchData();
    }, 1000); // 500ms delay
  }, []);

  // Get current access information from AuthContext
  const accessLevel = getAccessLevel();
  const accessPage = getAccessPage();
  const accessPageList = getAccessPageNames(accessPage,accessLevel);

  return (
    <div className="home-container">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="user-card">
            <div className="user-profile">
              <img src={userImg} alt="user" className="user-avatar" />
              <div className="user-info">
                <h3 className="user-name">{userInfo.firstName} {userInfo.lastName || ''}</h3>
                <p className="user-role">{getAccessLevelName(accessLevel)}</p>
              </div>
            </div>
            
            <div className="login-info">
              <p className="info-item">
                <span className="info-label">Last Login Time:</span>
                <span className="info-value">{userInfo.lastLoginTime || 'N/A'}</span>
              </p>
              <p className="info-item">
                <span className="info-label">Last Login IP:</span>
                <span className="info-value">{userInfo.lastLoginIp || 'N/A'}</span>
              </p>
              <p className="info-item">
                <span className="info-label">Access Level:</span>
                <span className="info-value">{accessLevel} - {getAccessLevelName(accessLevel)}</span>
              </p>
              <div className="info-item">
                <span className="info-label">Access Permissions:</span>
                <div className="info-value access-tags">
                  {accessPageList.map(page => (
                    <Tag color="blue" key={page}>{page}</Tag>
                  ))}
                  {accessPageList.length === 0 && <span>No permissions assigned</span>}
                </div>
              </div>
            </div>
          </Card>
          {/* Debug information */}
          <div style={{ display: 'none' }}>
            Debug: pendingItems.length = {pendingItems.length}
            First item: {pendingItems.length > 0 ? JSON.stringify(pendingItems[0]) : 'none'}
          </div>
          
          {/* Always render the card but conditionally show a message when no items */}
          <Card 
            className="pending-card" 
            style={{ marginTop: '16px' }} 
            title="Pending Confirmation Items"
          >
            {pendingItems && pendingItems.length > 0 ? (
              <Table
                columns={[
                  { title: 'Device ID', dataIndex: 'deviceID', key: 'deviceID' },
                  { title: 'Device Name', dataIndex: 'deviceName', key: 'deviceName' },
                  { title: 'Price', dataIndex: 'price', key: 'price', render: text => text ? `$${Number(text).toFixed(2)}` : 'N/A' },
                  { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate' },
                  { title: 'Room ID', dataIndex: 'roomID', key: 'roomID' },
                  { title: 'State', dataIndex: 'state', key: 'state' },
                  { title: 'Remark', dataIndex: 'remark', key: 'remark' }
                ]}
                dataSource={pendingItems}
                rowKey="deviceID"
                pagination={false}
                bordered
                size="small"
              />
            ) : (
              <div className="no-data-message" style={{ textAlign: 'center', padding: '20px' }}>
                No pending items to display
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;