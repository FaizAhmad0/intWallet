import React, { useEffect, useState } from "react";
import { Tabs, Button, Modal, Form, Input, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import Loader from "../../components/Loader";
import API from "../../utils/api";

import AdminEasyshipNew from "./AdminEasyshipNew";
import AdminEasyShipHMI from "./AdminEasyShipHMI";
import AdminEasyshipRTD from "./AdminEasyshipRTD";
import AdminEasyshipPNA from "./AdminEasyshipPNA";
import AdminEasyshipShipped from "./AdminEasyshipShipped";
import AdminEasyshipArchive from "./AdminEasyshipArchive";
import AdminEasyShipAll from "./AdminEasyShipAll";

const AdminEasyShipOrders = () => {
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
    <AdminLayout>
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
            children: <AdminEasyshipNew isActive={activeTab === "new"} />,
          },
          {
            key: "hmi",
            label: "HMI",
            children: <AdminEasyShipHMI isActive={activeTab === "hmi"} />,
          },
          {
            key: "rtd",
            label: "RTD",
            children: <AdminEasyshipRTD isActive={activeTab === "rtd"} />,
          },
          {
            key: "pna",
            label: "PNA",
            children: <AdminEasyshipPNA isActive={activeTab === "pna"} />,
          },
          {
            key: "shipped",
            label: "Shipped",
            children: (
              <AdminEasyshipShipped isActive={activeTab === "shipped"} />
            ),
          },
          {
            key: "archived",
            label: "Archived",
            children: (
              <AdminEasyshipArchive isActive={activeTab === "archived"} />
            ),
          },
          {
            key: "all",
            label: "All",
            children: <AdminEasyShipAll isActive={activeTab === "all"} />,
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
    </AdminLayout>
  );
};

export default AdminEasyShipOrders;
