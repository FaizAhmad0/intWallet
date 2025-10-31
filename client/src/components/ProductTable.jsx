import React, { useState } from "react";
import { Table, Modal, Form, Input, InputNumber, Button, message } from "antd";
import Loader from "./Loader";
import API from "../utils/api";

const ProductTable = ({
  products = [],
  total = 0,
  currentPage = 1,
  onPageChange,
  onUpdate,
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const showEditModal = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await API.put(`/products/${editingProduct._id}`, values);
      message.success("Product updated successfully");
      setEditModalVisible(false);
      form.resetFields();
      onUpdate(); // Refresh product list
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (val) => `₹${val}`,
    },
    {
      title: "Shipping",
      dataIndex: "shipping",
      key: "shipping",
      render: (val) => `₹${val}`,
    },
    {
      title: "GST Rate",
      dataIndex: "gstRate",
      key: "gstRate",
      render: (val) => `${val}%`,
    },
    { title: "Dimension", dataIndex: "dimension", key: "dimension" },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      render: (val) => `${val} kg`,
    },
    { title: "HSN", dataIndex: "hsn", key: "hsn" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showEditModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      {loading && <Loader />}
      <Table
        columns={columns}
        dataSource={products.map((item) => ({ ...item, key: item._id }))}
        pagination={{
          current: currentPage,
          total,
          pageSize: 20,
          onChange: onPageChange,
        }}
        bordered
      />

      <Modal
        title="Edit Product"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Update"
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="shipping"
            label="Shipping"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="gstRate"
            label="GST Rate (%)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
          <Form.Item
            name="dimension"
            label="Dimension"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="weight"
            label="Weight (kg)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="hsn" label="HSN Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductTable;
