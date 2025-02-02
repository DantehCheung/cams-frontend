import React, { useEffect, useState } from "react";
import { Col, Row, Card, Table } from "antd";
import "./home.css";
import userImg from "../../assets/images/cat.png";
import { getData } from "../../api/index";
import * as echarts from "echarts";

const Home = () => {
  const [tableData, setTableData] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getData();
        setTableData(res.data.data.detailedAssetTableData);
      } catch (error) {
        console.error("Fetch data error:", error);
      }
    };
    fetchData();

    // Initialize chart
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);
    
    // Chart configuration
    const option = {
      title: { 
        text: 'Those students not return items on time',
        left: 'center',
        textStyle: {
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        top: '20%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: { 
        type: 'category',
        data: ['Ken Lau 1', 'Ken Lau 2', 'Ken Lau 3', 'Ken Lau 4', 'Ken Lau 5', 'Ken Lau 6'],
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: { 
        type: 'value',
        axisLabel: {
          margin: 10
        }
      },
      series: [{
        data: [5, 20, 36, 10, 10, 20],
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    };

    myChart.setOption(option);

      // 在佈局完成後呼叫 resize
      setTimeout(() => {
        myChart.resize();
      }, 100);

    const resizeHandler = () => myChart.resize();
    window.addEventListener('resize', resizeHandler);

    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  return (
    <div className="home-container">
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} md={8}>
          <Card className="user-card">
            <div className="user-profile">
              <img src={userImg} alt="user" className="user-avatar" />
              <div className="user-info">
                <h3 className="user-name">Admin</h3>
                <p className="user-role">Administrator</p>
              </div>
            </div>
            
            <div className="login-info">
              <p className="info-item">
                <span className="info-label">Last Login Time:</span>
                <span className="info-value">2025-01-01 12:00:00</span>
              </p>
              <p className="info-item">
                <span className="info-label">Last Login Place:</span>
                <span className="info-value">Hong Kong</span>
              </p>
            </div>
          </Card>

          <Card className="table-card">
            <Table
              columns={columns}
              dataSource={tableData}
              scroll={{ x: 800, y: 300 }}
              pagination={false}
              rowKey="uniqueId"
              bordered
              size="middle"
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} md={16}>
          <Card className="chart-card">
            <div id="main" style={{ width: '100%', height: '600px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;