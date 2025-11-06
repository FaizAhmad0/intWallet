import React, { useEffect, useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { Table, Modal, Input, Button, Form, message, Space } from "antd";
import EditIcon from "@mui/icons-material/Edit";

const ManagerClients = () => {
  const [clients, setClients] = useState([]);
  console.log(clients);
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

  // 🔹 Search states
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [searching, setSearching] = useState(false);

  // Fetch Clients
  const fetchClients = async (page = 1, pageSize = 100, enrollmentId = "") => {
    setLoading(true);
    try {
      const res = await API.get(
        `/manager/my-clients?page=${page}&limit=${pageSize}&enrollmentId=${enrollmentId}`
      );
      setClients(res.data.users || []);
      setPagination({
        current: res.data.page || 1,
        pageSize,
        total: res.data.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      message.error(error?.response?.data?.message || "Error loading clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination) => {
    fetchClients(pagination.current, pagination.pageSize, searchEnrollment);
  };

  // 🔹 Search Handlers
  const handleEnrollmentInputChange = (e) => {
    setSearchEnrollment(e.target.value);
  };

  const handleEnrollmentSearch = async () => {
    if (!searchEnrollment.trim()) {
      message.warning("Please enter an enrollment ID");
      return;
    }
    setSearching(true);
    await fetchClients(1, pagination.pageSize, searchEnrollment.trim());
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchEnrollment("");
    fetchClients(1, pagination.pageSize, "");
  };

  // Modal open
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

  // Update client
  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const values = await form.validateFields();
      await API.put(`/admin/update-user/${selectedUser._id}`, values);
      message.success("User updated successfully");
      setOpenModal(false);
      fetchClients(pagination.current, pagination.pageSize, searchEnrollment);
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update user");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Table columns
  const columns = [
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
      title: "Primary Contact",
      dataIndex: "primaryContact",
      key: "primaryContact",
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
    <ManagerLayout>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-white">My Clients</h1>
              <h1 className="text-xl font-bold text-white">
                Total: {pagination.total}
              </h1>
            </div>
          </div>

          {/* 🔹 Search Bar */}
          <Space className="mb-4 px-4 pt-4" wrap>
            <Input
              placeholder="Search by Enrollment ID"
              value={searchEnrollment}
              onChange={handleEnrollmentInputChange}
              onPressEnter={handleEnrollmentSearch}
              allowClear
              onClear={handleClearSearch}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              onClick={handleEnrollmentSearch}
              loading={searching}
            >
              Search
            </Button>
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
    </ManagerLayout>
  );
};

export default ManagerClients;
