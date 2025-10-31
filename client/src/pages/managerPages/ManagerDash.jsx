import React, { useEffect, useState } from "react";
import {
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
  InputNumber,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import API from "../../utils/api";
import ManagerLayout from "../../layouts/ManagerLayout";

// Import your manager-specific tab components
import ManagerNew from "./ManagerNew";
import ManagerHMI from "./ManagerHMI";
import ManagerRTD from "./ManagerRTD";
import ManagerPNA from "./ManagerPNA";
import ManagerShipped from "./ManagerShipped";
import ManagerArchived from "./ManagerArchived";
import ManagerAll from "./ManagerAll";
import ManagerReturnAdj from "./ManagerReturnAdj";

// Placeholder components — replace with actual functional views
const EasyShipAllOrders = ({ isActive }) => (
  <div className="p-4">{isActive && "All EasyShip Orders Content"}</div>
);

const ManagerDash = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "new";
    setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (key) => {
    navigate(`?tab=${key}`);
  };

  const handleCreateOrder = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        status: "NEW",
      };

      console.log(payload);

      const res = await API.post("/easyshiporders/create", payload);

      const successMsg = res.data?.message || "Order created successfully!";

      message.success(successMsg);
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "Failed to create order.";

      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagerLayout>
      {/* Create New Order Button */}
      <div className="flex justify-end">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Create New Order
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarGutter={32}
        type="line"
        tabBarStyle={{ fontSize: "16px", fontWeight: 800 }}
        items={[
          {
            key: "new",
            label: "New",
            children: <ManagerNew isActive={activeTab === "new"} />,
          },
          {
            key: "hmi",
            label: "HMI",
            children: <ManagerHMI isActive={activeTab === "hmi"} />,
          },
          {
            key: "rtd",
            label: "RTD",
            children: <ManagerRTD isActive={activeTab === "rtd"} />,
          },
          {
            key: "pna",
            label: "PNA",
            children: <ManagerPNA isActive={activeTab === "pna"} />,
          },
          {
            key: "shipped",
            label: "Shipped",
            children: <ManagerShipped isActive={activeTab === "shipped"} />,
          },
          {
            key: "ra",
            label: "Return Adjust",
            children: <ManagerReturnAdj isActive={activeTab === "ra"} />,
          },
          {
            key: "archived",
            label: "Archived",
            children: <ManagerArchived isActive={activeTab === "archived"} />,
          },
          {
            key: "all",
            label: "All",
            children: <ManagerAll isActive={activeTab === "all"} />,
          },
        ]}
      />

      {/* Create Order Modal */}
      <Modal
        title="Create New EasyShip Order"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {loading ? (
          <Loader />
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateOrder}
            preserve={false}
          >
            <Form.Item
              label="Enrollment"
              name="enrollment"
              rules={[{ required: true, message: "Enrollment is required" }]}
            >
              <Input placeholder="Enter enrollment" />
            </Form.Item>

            <Form.Item
              label="Order ID"
              name="orderId"
              rules={[{ required: true, message: "Order ID is required" }]}
            >
              <Input placeholder="Enter order ID" />
            </Form.Item>

            <Form.Item
              label="Tracking ID"
              name="trackingId"
              rules={[{ required: true, message: "Tracking ID is required" }]}
            >
              <Input placeholder="Enter tracking ID" />
            </Form.Item>

            <Form.Item
              label="Delivery Partner"
              name="deliveryPartner"
              rules={[
                { required: true, message: "Delivery partner is required" },
              ]}
            >
              <Input placeholder="Enter delivery partner" />
            </Form.Item>
            <Form.Item
              label="Last mile Partner"
              name="lastmilePartner"
              rules={[
                { required: true, message: "Last mile partner is required" },
              ]}
            >
              <Input placeholder="Enter last mile partner" />
            </Form.Item>
            <Form.Item
              label="Last mile tracking ID"
              name="lastmileTrakingId"
              rules={[
                {
                  required: true,
                  message: "Last mile tracking ID is required",
                },
              ]}
            >
              <Input placeholder="Enter last mile tracking ID" />
            </Form.Item>
            <Form.Item
              label="Order Amount"
              name="orderAmount"
              rules={[{ required: true, message: "Order amount is required" }]}
            >
              <InputNumber
                placeholder="Enter Order amount"
                style={{ width: "100%" }}
                min={0} // optional: prevents negative values
              />
            </Form.Item>
            <Form.Item
              label="Shipping Amount"
              name="shippingAmount"
              rules={[
                { required: true, message: "Shipping amount is required" },
              ]}
            >
              <InputNumber
                placeholder="Enter shipping amount"
                style={{ width: "100%" }}
                min={0} // optional: prevents negative values
              />
            </Form.Item>
            <Form.Item
              label="Order Type"
              name="orderType"
              initialValue="Amazon"
              rules={[{ required: true, message: "Order type is required" }]}
            >
              <Select placeholder="Select order partner">
                <Select.Option value="ETSY">ETSY</Select.Option>
                <Select.Option value="Amazon">Amazon</Select.Option>

                <Select.Option value="Website/Custom">
                  Website/Custom
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: "Country is required" }]}
            >
              <Input placeholder="Enter country name" />
            </Form.Item>

            <div className="flex justify-end">
              <Button onClick={() => setIsModalOpen(false)} className="mr-2">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </ManagerLayout>
  );
};

export default ManagerDash;
