import React, { useState ,useRef, useEffect} from "react";
import { Card, Form, Input, Button, notification, Select, Row, Col, Spin, Typography, Divider, Tabs, Table, Space, DatePicker, Descriptions, Checkbox } from "antd";
const { Text } = Typography;
import "./return.css";
import { ScanOutlined, ClearOutlined, CheckCircleOutlined, HistoryOutlined, FileSearchOutlined, BookOutlined } from '@ant-design/icons';
import {useDispatch,useSelector} from 'react-redux';
import { returnSuccess } from "../../store/modules/returnSlice";
import { assetService } from "../../api";


// Get Electron IPC 
let electron;

try{
  electron = window.require && window.require('electron');
}catch(e){
  console.log("Running in browser environment, not Electron.");
}

const ipcRenderer = electron?.ipcRenderer;
const inBrowser = !ipcRenderer;


const Check = () => {

}

export default Check;