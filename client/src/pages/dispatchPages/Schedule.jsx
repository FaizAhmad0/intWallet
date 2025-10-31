import React, { useEffect, useState } from "react";
import { Table, Tag, message, Input, Space, Button } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const Schedule = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const response = await API.get("/orders/schedule", {
        params: { page, limit },
      });
      setOrders(response.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: response.data.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching schedule orders:", error);
      message.error("Failed to fetch scheduled orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      return fetchOrders(1, pagination.pageSize);
    }

    setSearchLoading(true);
    try {
      const res = await API.get("/orders/schedule/search", {
        params: { search: searchText.trim() },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.orders?.length || 0,
        current: 1,
      }));
    } catch (err) {
      console.error("Search error:", err);
      message.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim() === "") {
      fetchOrders(1, pagination.pageSize);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize);
  };

  const handleTrackingUpdate = async (shipmentId, orderId) => {
    if (!shipmentId) return message.warning("No shipment ID found");

    try {
      const res = await API.post("/orders/update-tracking", { shipmentId });
      message.success(res.data.message || "Tracking updated successfully");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to update tracking";
      console.error("Tracking update error:", error);
      message.error(errorMsg);
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
      title: "Shipment ID",
      dataIndex: "shipmentId",
      key: "shipmentId",
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
      render: (status) => (
        <Tag color="blue" style={{ borderRadius: 999, padding: "0 12px" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <button
          onClick={() => handleTrackingUpdate(record.shipmentId, record._id)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={!record.shipmentId}
        >
          Tracking Updated
        </button>
      ),
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <div className="bg-white p-4 rounded-xl shadow">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Order ID or Tracking ID"
          allowClear
          value={searchText}
          onChange={handleInputChange}
          style={{ width: 300 }}
        />
        <Button type="primary" loading={searchLoading} onClick={handleSearch}>
          Search
        </Button>
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

export default Schedule;
