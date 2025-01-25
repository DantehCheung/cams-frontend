import React from "react";
import { Col, Row, Card } from "antd";
import "./home.css";
import userImg from "../../assets/images/cat.png";

const Home = () => {
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
          </Card>
        </Col>
        <Col span={16}></Col>
      </Row>
    </div>
  );
};
export default Home;
