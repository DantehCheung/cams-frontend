import React from "react";
import { Typography, Select, Button, Divider, List } from "antd";

const { Title } = Typography;

const downloadVer = () => {
  return (
    <div>
      <form action="">
      <Title level={2}>Download App Version</Title>
      <p>
          <label>Distribution Package: </label>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="installer, .zip"
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={[
              {
                value: "1",
                label: "installer",
              },
              {
                value: "2",
                label: ".zip",
              }
            ]}
          />
        </p>

         <br />
                <p>
                  <label>OS Choice: </label>
                  <Select
                    showSearch
                    style={{ width: 265 }}
                    placeholder="windows, linux, mac"
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={[
                      {
                        value: "1",
                        label: "windows",
                      },
                        {
                            value: "2",
                            label: "linux",
                        },
                        {
                            value: "3",
                            label: "mac",
                        }
                    ]}
                  />
                  </p>
                  <p style={{ marginTop: '20px' }}>
                    <Button type="primary" style={{ marginRight: '20px' }}>
                        Download</Button>
                        <Button type="primary" danger>Cancel</Button>
                  </p>
      </form>
    </div>
  );
}

export default downloadVer;