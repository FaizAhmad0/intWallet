import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../utils/api";
import { Table, Modal, Input, Button, Form, message, Space } from "antd";
import Loader from "../../components/Loader";

const WalletAction = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [modal, setModal] = useState({ open: false, type: "", user: null });
  const [transactions, setTransactions] = useState([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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

  const openModal = (type, user) => {
    setModal({ open: true, type, user });
    form.resetFields();
    if (type === "transactions") fetchTransactions(user._id);
  };

  const fetchTransactions = async (userId) => {
    try {
      const res = await API.get(`/admin/user-transactions/${userId}`);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      message.error("Failed to load transactions");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const endpoint =
        modal.type === "add" ? "/admin/add-money" : "/admin/deduct-money";
      const payload = {
        userId: modal.user._id,
        enrollmentIdAmazon: modal.user.enrollmentIdAmazon,
        amount: values.amount,
        description: values.description,
      };
      const res = await API.post(endpoint, payload);
      message.success(res.data.message);
      setModal({ open: false, type: "", user: null });
      fetchClients(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Operation failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      render: (text) => <span>{`****${text?.slice(-4)}`}</span>,
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span className="text-sm text-black">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => openModal("add", record)}>
            Add
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => openModal("deduct", record)}
          >
            Deduct
          </Button>
          <Button onClick={() => openModal("transactions", record)}>
            Transactions
          </Button>
        </div>
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
                <h1 className="text-2xl font-bold text-white">
                  Manage Client's Wallet
                </h1>
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
            </Space>

            <div className="bg-white rounded-xl shadow-md">
              <Table
                columns={columns}
                dataSource={clients}
                rowKey="_id"
                pagination={pagination}
                onChange={handleTableChange}
                bordered
                scroll={{ x: true }}
              />
            </div>
          </>
        )}

        <Modal
          title={`${
            modal.type === "add"
              ? "Add"
              : modal.type === "deduct"
              ? "Deduct"
              : "View"
          } Wallet`}
          open={modal.open}
          onCancel={() => setModal({ open: false, type: "", user: null })}
          onOk={modal.type !== "transactions" ? handleSubmit : undefined}
          okText={modal.type === "transactions" ? "Close" : "Submit"}
          confirmLoading={submitting}
        >
          {modal.type === "transactions" ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {transactions.length ? (
                <Table
                  bordered
                  dataSource={transactions}
                  columns={[
                    {
                      title: "Type",
                      dataIndex: "credit",
                      key: "type",
                      render: (credit) => (
                        <span
                          className={credit ? "text-green-600" : "text-red-600"}
                        >
                          {credit ? "Credited" : "Debited"}
                        </span>
                      ),
                    },
                    {
                      title: "Amount (₹)",
                      dataIndex: "amount",
                      key: "amount",
                    },
                    {
                      title: "Description",
                      dataIndex: "description",
                      key: "description",
                    },
                    {
                      title: "Date",
                      dataIndex: "createdAt",
                      key: "createdAt",
                      render: (date) => {
                        const d = new Date(date);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hours = String(d.getHours()).padStart(2, "0");
                        const minutes = String(d.getMinutes()).padStart(2, "0");
                        return `${day}/${month}/${year} ${hours}:${minutes}`;
                      },
                    },
                  ]}
                  pagination={{ pageSize: 20 }}
                  rowKey={(record, index) => index}
                  size="small"
                  scroll={{ x: true }}
                />
              ) : (
                <p>No transactions found.</p>
              )}
            </div>
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: "Amount is required" }]}
              >
                <Input placeholder="Enter amount" type="number" min={1} />
              </Form.Item>
              <Form.Item
                name="description"
                label="description"
                rules={[{ required: true, message: "description is required" }]}
              >
                <Input placeholder="Enter description" />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default WalletAction;
