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

const DispatchHMI = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchOrders = async (
    page = 1,
    limit = 100,
    orderId = "",
    enrollment = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "HMI",
        page,
        limit,
      });

      if (orderId) params.append("orderId", orderId);
      if (enrollment) params.append("enrollment", enrollment);

      const res = await API.get(`/orders/hmi/search?${params.toString()}`);

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

  const handleArchive = async (shipmentId) => {
    try {
      const res = await API.post("/orders/archive", { shipmentId });
      message.success(res.data.message || "Order archived successfully");
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim(),
        searchEnrollment.trim()
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to archive the order";
      message.error(msg);
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

      const res = await API.get(
        `/orders/search-by-status?status=HMI&from=${from}&to=${to}&page=${pagination.current}&limit=${pagination.pageSize}`
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
    if (!searchOrderId.trim() && !searchEnrollment.trim()) {
      message.warning("Please enter Order ID or Enrollment to search.");
      return;
    }
    fetchOrders(
      1,
      pagination.pageSize,
      searchOrderId.trim(),
      searchEnrollment.trim()
    );
  };

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === "orderId") {
      setSearchOrderId(value);
      if (value.trim() === "" && searchEnrollment.trim() === "") {
        fetchOrders(1, pagination.pageSize);
      }
    } else if (type === "enrollment") {
      setSearchEnrollment(value);
      if (value.trim() === "" && searchOrderId.trim() === "") {
        fetchOrders(1, pagination.pageSize);
      }
    }
  };

  const handleTableChange = (pagination) => {
    fetchOrders(
      pagination.current,
      pagination.pageSize,
      searchOrderId.trim(),
      searchEnrollment.trim()
    );
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
      await API.post(`/orders/pay`, {
        enrollment,
        orderId,
        finalAmount,
      });
      message.success("Payment successful and order updated!");
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim(),
        searchEnrollment.trim()
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
      title: "Asku",
      dataIndex: "asku",
      key: "asku",
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
            onClick={() => handleArchive(record.shipmentId)}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
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
          onChange={(e) => handleInputChange(e, "orderId")}
          onPressEnter={handleSearch}
          allowClear
          style={{ width: 200 }}
        />
        <Input
          placeholder="Search by Enrollment"
          value={searchEnrollment}
          onChange={(e) => handleInputChange(e, "enrollment")}
          onPressEnter={handleSearch}
          allowClear
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
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
          Filter by Date
        </Button>
        <Button className="font-bold" type="primary">
          Total Orders : {pagination.total}
        </Button>
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

export default DispatchHMI;
