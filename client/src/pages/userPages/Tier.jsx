import React from "react";
import { Result, Button } from "antd";
import UserLayout from "../../layouts/UserLayout";

import { ToolOutlined } from "@ant-design/icons";

const Tier = () => {
  return (
    <UserLayout>
      <div className="flex justify-center items-center h-[80vh]">
        <Result
          icon={<ToolOutlined style={{ fontSize: "60px", color: "#1890ff" }} />}
          title="This Page is Under Construction"
          subTitle="We are working hard to bring this feature to life. Please check back soon!"
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    </UserLayout>
  );
};

export default Tier;
