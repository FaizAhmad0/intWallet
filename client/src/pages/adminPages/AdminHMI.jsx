import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  message,
  Button,
  Modal,
  Input,
  Space,
  DatePicker,
} from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AdminHMI = ({ isActive }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      message.success("Session expired or not logged in. Please log in again!");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        navigate("/");
        message.success(
          "Session expired or not logged in. Please log in again!"
        );
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/");
      message.success("Session expired or not logged in. Please log in again!");
    }
  }, [navigate]);

  const fetchOrders = async (page = 1, limit = 100, searchId = "") => {
    setLoading(true);
    try {
      const endpoint = searchId
        ? `/orders/hmi/search?orderId=${searchId}`
        : `/orders/hmi?page=${page}&limit=${limit}`;
      const res = await API.get(endpoint);
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || res.data.orders.length,
      });
    } catch (err) {
      console.error("Failed to fetch orders", err);
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredOrders = async () => {
    try {
      if (dateRange.length !== 2) {
        return message.warning("Please select a date range.");
      }

      setLoading(true);

      const from = dayjs(dateRange[0]).format("YYYY-MM-DD");
      const to = dayjs(dateRange[1]).format("YYYY-MM-DD");
      const status = "HMI"; // hardcoded status

      const res = await API.get(
        `/orders/search-by-status?status=${status}&from=${from}&to=${to}&page=${pagination.current}&limit=${pagination.pageSize}`
      );

      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching filtered orders:", err);
      message.error("Failed to fetch filtered orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchOrderId.trim()) {
      message.warning("Please enter an Order ID to search.");
      return;
    }
    fetchOrders(1, pagination.pageSize, searchOrderId.trim());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchOrderId(value);
    if (value.trim() === "") {
      fetchOrders(1, pagination.pageSize);
    }
  };

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize, searchOrderId.trim());
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
      const res = await API.post(`/orders/pay`, {
        enrollment,
        orderId,
        finalAmount,
      });
      message.success("Payment successful and order updated!");
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim()
      );
    } catch (err) {
      message.error(err.response?.data?.message || "Payment failed");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()}`;
      },
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
        if (status === "HMI") color = "green";
        else if (status === "HMI") color = "orange";

        return (
          <Tag
            color={color}
            style={{
              borderRadius: "999px",
              padding: "0 12px",
              fontWeight: 500,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
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
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isActive) {
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim()
      );
    }
  }, [isActive, pagination.current]);

  return loading ? (
    <Loader />
  ) : (
    <div className="bg-white p-4 rounded-xl shadow">
      <Space className="mb-4" wrap>
        <Input
          placeholder="Search by Order ID"
          value={searchOrderId}
          onChange={handleInputChange}
          onPressEnter={handleSearch}
          allowClear
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
        <div className=" flex flex-wrap gap-2 items-center">
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(val) => {
              if (!val || val.length === 0) {
                setDateRange([]);
                fetchOrders(); // Re-fetch all orders when cleared
              } else {
                setDateRange(val);
              }
            }}
            format="DD/MM/YYYY"
          />
          <Button
            type="primary"
            onClick={fetchFilteredOrders}
            disabled={dateRange.length !== 2}
          >
            Search
          </Button>
          <Button className="font-bold" type="primary">
            Total Orders : {pagination.total}
          </Button>
        </div>
      </Space>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default AdminHMI;
