import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../utils/api";
import {
  Table,
  Modal,
  Tag,
  Input,
  Button,
  Form,
  message,
  Space,
  Tooltip,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import Loader from "../../components/Loader";
import EditIcon from "@mui/icons-material/Edit";
import UploadUsers from "../../components/UploadUsers";

const AllClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [searching, setSearching] = useState(false);

  const handleEnrollmentSearch = async () => {
    if (!searchEnrollment.trim()) return;

    setSearching(true);
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/get-client-by-enrollment/${searchEnrollment.trim()}`
      );
      if (res?.data?.client) {
        setClients([res.data.client]);
        setPagination({ current: 1, pageSize: 1, total: 1 });
      } else {
        message.warning("User not found");
      }
    } catch (error) {
      message.error("User not found");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleEnrollmentClear = () => {
    setSearchEnrollment("");
    fetchClients(); // Reload all users
  };

  const handleEnrollmentInputChange = (e) => {
    const value = e.target.value;
    setSearchEnrollment(value);
    if (!value) {
      handleEnrollmentClear(); // Auto-clear
    }
  };

  const fetchClients = async (page = 1, pageSize = 100) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/all-clients?page=${page}&limit=${pageSize}`
      );
      setClients(res.data.clients);
      setPagination({
        current: res.data.page,
        pageSize,
        total: res.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleTableChange = (pagination) => {
    fetchClients(pagination.current, pagination.pageSize);
  };

  const showModal = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user?.name || "",
      brandName: user?.brandName || "",
      email: user?.email || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
      country: user?.country || "",
      gst: user?.gst || "",
      address: user?.address || "",
      primaryContact: user?.primaryContact || "",
    });
    setOpenModal(true);
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const values = await form.validateFields();
      await API.put(`/admin/update-user/${selectedUser._id}`, values);
      message.success("User updated successfully");
      setOpenModal(false);
      fetchClients(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update user");
    } finally {
      setUpdateLoading(false);
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
      title: "Enrollment",
      dataIndex: "enrollmentIdAmazon",
      key: "enrollmentIdAmazon",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-sm text-black",

      render: (text) => {
        if (!text) return "-";

        const [localPart, domain] = text.split("@");
        const visible = localPart?.slice(0, 2);
        const masked = "*".repeat(Math.max(localPart.length - 2, 0));
        return (
          <span className="break-all lowercase">{`${visible}${masked}@${domain}`}</span>
        );
      },
    },
    {
      title: "Manager",
      dataIndex: "amazonManager",
      key: "amazonManager",
      className: "text-sm text-black",
    },

    {
      title: "Primary Contact",
      dataIndex: "primaryContact",
      key: "primaryContact",
      className: "text-sm text-black",

      render: (text) => {
        const lastFour = text?.slice(-4);
        return <span>{`****${lastFour}`}</span>;
      },
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      className: "text-sm text-black",
    },
    {
      title: "Action",
      className: "text-xs text-black",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => showModal(record)}
          icon={<EditIcon />}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-white">All Users</h1>
                <h1 className="text-xl font-bold text-white">
                  Total: {pagination.total}
                </h1>
              </div>
            </div>
            <Space className="mb-4 px-4 pt-4" wrap>
              <Input
                placeholder="Search by Enrollment ID"
                value={searchEnrollment}
                onChange={handleEnrollmentInputChange}
                onPressEnter={handleEnrollmentSearch}
                allowClear
                style={{ width: 300 }}
              />
              <Button
                type="primary"
                onClick={handleEnrollmentSearch}
                loading={searching}
              >
                Search
              </Button>
              <UploadUsers />
            </Space>

            <Table
              columns={columns}
              dataSource={clients}
              rowKey="_id"
              pagination={pagination}
              onChange={handleTableChange}
              bordered
              scroll={{ x: true }}
            />
          </>
        )}

        <Modal
          title="Update Client Details"
          open={openModal}
          onCancel={() => setOpenModal(false)}
          onOk={handleUpdate}
          confirmLoading={updateLoading}
          okText="Save"
          width={600}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Name">
              <Input placeholder="Enter name" />
            </Form.Item>
            <Form.Item name="brandName" label="Brand Name">
              <Input placeholder="Enter brand name" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item name="state" label="State">
              <Input placeholder="Enter state" />
            </Form.Item>
            <Form.Item name="pincode" label="Pincode">
              <Input placeholder="Enter pincode" />
            </Form.Item>
            <Form.Item name="country" label="Country">
              <Input placeholder="Enter country" />
            </Form.Item>
            <Form.Item name="gst" label="GST Number">
              <Input placeholder="Enter GST number" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter address" />
            </Form.Item>
            <Form.Item name="primaryContact" label="Primary Contact">
              <Input placeholder="Enter primary contact" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AllClients;
