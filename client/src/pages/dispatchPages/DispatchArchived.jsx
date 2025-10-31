import React, { useEffect, useState } from "react";
import { Table, Tag, message, Input, Space, Button } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const DispatchArchived = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const handleUnarchive = async (shipmentId) => {
    if (!shipmentId) return message.warning("Shipment ID missing");

    try {
      const res = await API.post("/orders/unarchive", { shipmentId });
      message.success(res.data.message || "Order unarchived successfully");
      fetchOrders(pagination.current, pagination.pageSize); // refresh table
    } catch (error) {
      console.error("Unarchive error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to unarchive order";
      message.error(errorMsg);
    }
  };

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const response = await API.get("/orders/archived", {
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
      console.error("Error fetching archived orders:", error);
      message.error("Failed to fetch archived orders");
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
      const res = await API.get("/orders/archived/search", {
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
      render: (status) => (
        <Tag color="red" style={{ borderRadius: 999, padding: "0 12px" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => handleUnarchive(record.shipmentId)}
          disabled={!record.shipmentId}
        >
          Unarchived
        </Button>
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

export default DispatchArchived;
