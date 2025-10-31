import React, { useEffect, useState } from "react";
import { Table, Tag, message, Input, Button, Space, DatePicker } from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import dayjs from "dayjs";

const DispatchShipped = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchOrders = async (page = 1, limit = 100, searchTrackingId = "") => {
    setLoading(true);
    try {
      const endpoint = searchTrackingId
        ? `/orders/shipped/search?trackingId=${searchTrackingId}`
        : `/orders/shipped?page=${page}&limit=${limit}`;
      const res = await API.get(endpoint);
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || res.data.orders.length,
      });
    } catch (err) {
      console.error("Failed to fetch SHIPPED orders", err);
      message.error("Failed to load SHIPPED orders");
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
      const status = "SHIPPED"; // hardcoded status

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

  const handleUnship = async (orderId) => {
    try {
      setLoading(true);
      await API.patch(`/orders/${orderId}/status`, { status: "RTD" });
      message.success("Order marked as RTD.");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Failed to update order status", err);
      message.error("Failed to mark order as RTD.");
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

  const handleSearch = () => {
    if (!trackingId.trim()) {
      message.warning("Please enter a tracking ID.");
      return;
    }
    fetchOrders(1, 10, trackingId.trim());
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
      render: (status) => (
        <Tag
          color="blue"
          style={{
            borderRadius: "999px",
            padding: "0 12px",
            fontWeight: 500,
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button danger type="link" onClick={() => handleUnship(record.orderId)}>
          Unshipped
        </Button>
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
                  fetchOrders(1, pagination.pageSize); // Reload all orders when cleared
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
            scroll={{ x: "max-content" }}
            bordered
          />
        </div>
      )}
    </>
  );
};

export default DispatchShipped;
