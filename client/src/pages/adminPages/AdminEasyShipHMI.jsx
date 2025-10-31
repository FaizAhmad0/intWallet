import React, { useEffect, useState } from "react";
import { Table, Input, Space, Button, message, Tag, Modal } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const AdminEasyShipHMI = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const status = "HMI";

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const res = await API.get("/easyshiporders/get-all-order", {
        params: { page, limit, status },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: res.data.total || 0,
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch EasyShip HMI orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const search = searchText.trim();
    if (!search) return fetchOrders(1, pagination.pageSize);

    setSearchLoading(true);
    try {
      const res = await API.get("/easyshiporders/search", {
        params: { search, status },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: res.data.total || 0,
      }));
    } catch (error) {
      console.error("Search error:", error);
      message.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (val.trim() === "") {
      fetchOrders(1, pagination.pageSize);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize);
  };

  const showBalance = async (enrollment) => {
    try {
      const res = await API.get(`/user/balance/${enrollment}`);
      Modal.info({
        title: "User Balance",
        content: <p>₹ {res.data.amount}</p>,
      });
    } catch (err) {
      message.error("Failed to fetch balance");
    }
  };

  const handlePay = async (enrollment, orderId, finalAmount) => {
    try {
      await API.post(`/easyshiporders/pay`, {
        enrollment,
        orderId,
        finalAmount,
      });
      message.success("Payment successful and order updated!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Payment failed");
    }
  };

  const handleArchive = async (orderId) => {
    try {
      await API.put(`/easyshiporders/archive`, { orderId });
      message.success("Order archived successfully!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error("Failed to archive order");
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
    }
  }, [isActive, pagination.current]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
    },
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "brandName",
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Total Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount) => `₹ ${amount}`,
    },
    {
      title: "Tracking ID",
      dataIndex: "trackingId",
      key: "trackingId",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Delivery Partner",
      dataIndex: "deliveryPartner",
      key: "deliveryPartner",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "NEW") color = "green";
        else if (status === "HMI") color = "orange";

        return (
          <Tag color={color} style={{ borderRadius: 999, padding: "0 12px" }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 flex-wrap">
          <Button type="primary" onClick={() => showBalance(record.enrollment)}>
            Show Balance
          </Button>
          <Button
            type="default"
            onClick={() =>
              handlePay(record.enrollment, record._id, record.finalAmount)
            }
          >
            Pay
          </Button>
          <Button
            danger
            type="dashed"
            onClick={() => handleArchive(record._id)}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <div className="bg-white rounded-xl shadow">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search by Order ID, Tracking ID, or Enrollment"
          allowClear
          value={searchText}
          onChange={handleInputChange}
          style={{ width: 320 }}
        />
        <Button type="primary" loading={searchLoading} onClick={handleSearch}>
          Search
        </Button>
        <Button type="default">Total Orders: {pagination.total}</Button>
      </Space>
      <Table
        bordered
        dataSource={orders}
        columns={columns}
        scroll={{ x: "max-content" }}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default AdminEasyShipHMI;
