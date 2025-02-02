import React, { useState } from "react";
import { Card, Form, Input, Button, DatePicker, Select, Typography } from "antd";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const GenReport = () => {
  const [form] = Form.useForm();
  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = (values) => {
    setReportLoading(true);
    // TODO: generate report logic
    setTimeout(() => {
      setReportLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={2}>Generate Report</Title>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleGenerateReport}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="reportType" label="Report Type" rules={[{ required: true }]}>
            <Select placeholder="Select report type">
              <Select.Option value="inventory">Inventory</Select.Option>
              <Select.Option value="borrow">Borrowing History</Select.Option>
              <Select.Option value="return">Return History</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range" rules={[{ required: true }]}>
            <RangePicker />
          </Form.Item>
          <Form.Item name="extraNote" label="Extra Notes">
            <Input.TextArea rows={4} placeholder="Any additional information?" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={reportLoading}
            >
              Generate
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GenReport;