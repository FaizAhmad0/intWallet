import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, Form, Input, message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import AdminLayout from "../../layouts/AdminLayout";
import Loader from "../../components/Loader";
import API from "../../utils/api";
import CreateNewManager from "../../components/CreateNewManager";

const AllManagers = () => {
  const [managers, setManagers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [form] = Form.useForm();

  const fetchManagers = async (page = 1, pageSize = 100) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/managers?page=${page}&limit=${pageSize}`
      );
      setManagers(res.data.data);
      setPagination({
        current: res.data.page,
        pageSize: res.data.limit,
        total: res.data.total,
      });
    } catch (err) {
      console.error("Failed to fetch managers", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleTableChange = (pagination) => {
    fetchManagers(pagination.current, pagination.pageSize);
  };

  const handleEdit = (record) => {
    setEditingManager(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      primaryContact: record.primaryContact || "",
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await API.put(`/admin/managers/${editingManager._id}`, values);
      message.success("Manager updated successfully");
      setIsModalVisible(false);
      fetchManagers(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error(err);
      message.error("Failed to update manager");
    }
  };

  const columns = [
    {
      title: "UID",
      dataIndex: "uid",
      render: (uid) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tag color="blue">UID{uid}</Tag>
          <Tooltip title="Copy UID">
            <CopyOutlined
              onClick={() => {
                navigator.clipboard.writeText(`UID${uid}`);
                message.success("Copied UID to clipboard!");
              }}
              style={{ cursor: "pointer", color: "#1890ff" }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Password",
      dataIndex: "password",
      render: (password) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{password}</span>
          <Tooltip title="Copy Password">
            <CopyOutlined
              onClick={() => {
                navigator.clipboard.writeText(password);
                message.success("Password copied!");
              }}
              style={{ cursor: "pointer", color: "#1890ff" }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-sm">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Primary Contact",
      dataIndex: "primaryContact",
      key: "primaryContact",
      render: (text) => text || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role.toUpperCase()}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => handleEdit(record)} type="primary">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader />
        </div>
      ) : (
        <>
          <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-white">All Managers</h1>
              <h1 className="text-xl font-bold text-white">
                Total: {pagination.total}
              </h1>
              <CreateNewManager />
            </div>
          </div>
          <Table
            bordered
            dataSource={managers}
            columns={columns}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            className="shadow-lg rounded-xl"
          />
        </>
      )}
      <Modal
        title="Edit Manager"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdate}
        okText="Update"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Primary Contact"
            name="primaryContact"
            rules={[{ required: true, message: "Please enter contact" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AllManagers;
