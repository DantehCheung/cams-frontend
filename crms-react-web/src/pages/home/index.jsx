import React, { useEffect, useState } from "react";
import { Col, Row, Card } from "antd";
import "./home.css";
import userImg from "../../assets/images/cat.png";
import { getData } from "../../api/index";
import { Space, Table, Tag } from 'antd';
import * as echarts from 'echarts';



// Define the column list
const columns = [
  {
    title: 'Campus',
    dataIndex: 'campus',
    key: 'campus',
  },
  {
    title: 'Item',
    dataIndex: 'item',
    key: 'item',
  },
  {
    title: 'Part',
    dataIndex: 'part',
    key: 'part',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (text) => `$${text.toFixed(2)}`, // Format price as currency
  },
  {
    title: 'Purchase Date',
    dataIndex: 'purchaseDate',
    key: 'purchaseDate',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Room',
    dataIndex: 'room',
    key: 'room',
  },
  {
    title: 'Unique ID',
    dataIndex: 'uniqueId',
    key: 'uniqueId',
  }
];
    


const Home = () => {

  //fetch mock data for testing api request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getData();
        console.log(res.data, "res");
        console.log(res.data.data.detailedAssetTableData)
        const { detailedAssetTableData } = res.data.data;
        setTableData(detailedAssetTableData);
      } catch (error) {
        console.error("fetch data failure:", error);
      }
    };
    fetchData();



    // Create the echarts instance
var myChart = echarts.init(document.getElementById('main'));

// Draw the chart
myChart.setOption({
  title: {
    text: 'Those students not return items on time'
  },
  tooltip: {},
  xAxis: {
    data: ['Ken Lau 1', 'Ken Lau 2', 'Ken Lau 3', 'Ken Lau 4', 'Ken Lau 5', 'Ken Lau 6']
  },
  yAxis: {},
  series: [
   {
    name: 'expired items',
    type: 'bar',
    data: [
      { value: 5, itemStyle: { color: '#5470C6' } },
      { value: 20, itemStyle: { color: '#91CC75' } },
      { value: 36, itemStyle: { color: '#FAC858' } },
      { value: 10, itemStyle: { color: '#EE6666' } },
      { value: 10, itemStyle: { color: '#73C0DE' } },
      { value: 20, itemStyle: { color: '#3BA272' } }
    ]
   }
  ],
  
});

  }, []);

  
  // define table data
  const [tableData,setTableData] = useState([])


  return (
    <div>
      <Row className="home">
        <Col span={8}>
          <Card hoverable className="userCard">
            <div className="user">
              <img src={userImg} />
              <div className="userinfo">
                <p className="name">Admin</p>
                <p className="access">Admin</p>
              </div>
            </div>
            <div className="login-info">
              <p>
                Last Login Time:
                <span>2025-01-01 12:00:00</span>
              </p>
              <p>
                Last Login Place:
                <span>Hong Kong</span>
              </p>
            </div>
          </Card>
          <Card hoverable className="tableCard">
             <Table columns={columns} dataSource={tableData} pagination={false} rowKey={"uniqueId" /* each table should have key */}/>
          </Card>
        </Col>
        <Col span={16}>

          <Card hoverable className="chartCard">
            <div id="main" style={{ width: 800, height: 300 }}></div>
            </Card>
        </Col>
      </Row>
      
      <Row>

      </Row>
    </div>
  );
};
export default Home;
