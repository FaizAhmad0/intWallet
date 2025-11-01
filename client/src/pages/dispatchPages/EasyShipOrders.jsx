import React, { useEffect, useState } from "react";
import { Tabs, Button, Modal, Form, Input, message, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import DispatchLayout from "../../layouts/DispatchLayout";
import Loader from "../../components/Loader";
import API from "../../utils/api";
import EasyShipNewOrders from "./EasyShipNewOrders";
import EasyShipHMI from "./EasyShipHMI";
import EasyShipRTD from "./EasyShipRTD";
import EasyShipPNA from "./EasyShipPNA";
import EasyShipShipped from "./EasyShipShipped";
import EasyShipArchived from "./EasyShipArchived";
import EasyShipAll from "./EasyShipAll";
import EasyReturnAdj from "./EasyReturnAdj";

// Placeholder components — replace with actual functional views
const EasyShipAllOrders = ({ isActive }) => (
  <div className="p-4">{isActive && "All EasyShip Orders Content"}</div>
);

const EasyShipOrders = () => {
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
    <DispatchLayout>
      {/* Create New Order Button */}
      {/* <div className="flex justify-end">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Create New Order
        </Button>
      </div> */}

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
            children: <EasyShipNewOrders isActive={activeTab === "new"} />,
          },
          {
            key: "hmi",
            label: "HMI",
            children: <EasyShipHMI isActive={activeTab === "hmi"} />,
          },
          {
            key: "rtd",
            label: "RTD",
            children: <EasyShipRTD isActive={activeTab === "rtd"} />,
          },
          {
            key: "pna",
            label: "PNA",
            children: <EasyShipPNA isActive={activeTab === "pna"} />,
          },
          {
            key: "shipped",
            label: "Shipped",
            children: <EasyShipShipped isActive={activeTab === "shipped"} />,
          },
          {
            key: "ra",
            label: "Return Adjust",
            children: <EasyReturnAdj isActive={activeTab === "ra"} />,
          },
          {
            key: "archived",
            label: "Archived",
            children: <EasyShipArchived isActive={activeTab === "archived"} />,
          },
          {
            key: "all",
            label: "All",
            children: <EasyShipAll isActive={activeTab === "all"} />,
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
              label="Order Type"
              name="orderType"
              initialValue="Self-ship"
              rules={[{ required: true, message: "Order type is required" }]}
            >
              <Select placeholder="Select delivery partner">
                <Select.Option value="Easy-ship">Easy-ship</Select.Option>
                <Select.Option value="Self-ship">Self-ship</Select.Option>
              </Select>
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
    </DispatchLayout>
  );
};

export default EasyShipOrders;
