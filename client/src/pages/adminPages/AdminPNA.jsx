import React, { useEffect, useState } from "react";
import { Table, Tag, message, Input, Button, Space, DatePicker } from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import dayjs from "dayjs";

const AdminPNA = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);
  const [trackingId, setTrackingId] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchOrders = async (page = 1, limit = 100, searchTrackingId = "") => {
    setLoading(true);
    try {
      const endpoint = searchTrackingId
        ? `/orders/pna/search?trackingId=${searchTrackingId}`
        : `/orders/pna?page=${page}&limit=${limit}`;
      const res = await API.get(endpoint);
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || res.data.orders.length,
      });
    } catch (err) {
      console.error("Failed to fetch PNA orders", err);
      message.error("Failed to load PNA orders");
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
      const status = "PNA"; // hardcoded status

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

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
    }
  }, [isActive, pagination.current]);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleMarkAvailable = async (shipmentId) => {
    try {
      await API.post("/orders/mark-available", { shipmentId });
      message.success("Order marked as available (RTD)");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark available");
    }
  };

  const handleSearch = () => {
    if (!trackingId.trim()) {
      message.warning("Please enter a tracking ID.");
      return;
    }
    fetchOrders(1, pagination.pageSize, trackingId.trim());
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
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
      title: "Total Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount) => `₹ ${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "PNA" ? "red" : "default";
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
        <button
          onClick={() => handleMarkAvailable(record.shipmentId)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Mark Available
        </button>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <Space className="mb-4" wrap>
            <Input
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={(e) => {
                const value = e.target.value;
                setTrackingId(value);
                if (value.trim() === "") {
                  fetchOrders(1, pagination.pageSize);
                }
              }}
              allowClear
              className="w-64"
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
      )}
    </>
  );
};

export default AdminPNA;
