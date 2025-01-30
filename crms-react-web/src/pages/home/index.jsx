import React, { useEffect, useState } from "react";
import { Col, Row, Card } from "antd";
import "./home.css";
import userImg from "../../assets/images/cat.png";
import { getData } from "../../api/index";
import { Space, Table, Tag } from 'antd';


  // define table columns
  const columns =  [
    {
    title:'Course Name',
    dataIndex:'name'
    },
    {
      title:'Today Sales',
      dataIndex:'todayBuy'
    },
    {
        title:'Month Sales',
      dataIndex:'monthBuy'
    },
    {
      title:'Total Sales',
      dataIndex:'totalBuy'
    }
  ]
    

const Home = () => {

  //fetch mock data for testing api request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getData();
        console.log(res.data, "res");
        console.log(res.data.data.tableData)
        const {tableData} = res.data.data;
       setTableData(tableData)
      } catch (error) {
        console.error("fetch data failure:", error);
      }
    };
    fetchData();
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
          <Card hoverable className="userCard">
             <Table columns={columns} dataSource={tableData} pagination={false} rowKey={"name" /* each table should have key */}/>
          </Card>
        </Col>
        <Col span={16}>
         
        </Col>
      </Row>
      
      <Row>

      </Row>
    </div>
  );
};
export default Home;
