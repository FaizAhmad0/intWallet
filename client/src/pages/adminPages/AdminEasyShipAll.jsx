import React, { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Table, Input, Space, Button, message, Tag, Popconfirm } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const AdminEasyShipAll = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const status = "";

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
      message.error("Failed to fetch EasyShip RTD orders");
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

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
    }
  }, [isActive, pagination.current]);

  // ✅ Handler to update status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/easyshiporders/update-status/${orderId}`, {
        status: newStatus,
      });
      message.success(`Order marked as ${newStatus}`);
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("Status update error:", err);
      message.error("Failed to update order status");
    }
  };

  const getRowClassName = (status) => {
    switch (status) {
      case "HMI":
        return "bg-blue-50";
      case "In Progress":
        return "bg-yellow-50";
      case "SHIPPED":
        return "bg-green-50";
      case "NEW":
        return "bg-gray-50";
      case "Recieved":
        return "bg-emerald-50";
      case "Schedule":
        return "bg-sky-50";
      case "RTD":
        return "bg-pink-50";
      case "PNA":
        return "bg-orange-50";
      case "Archived":
        return "bg-neutral-200";
      default:
        return "";
    }
  };

  const statusTagColors = {
    NEW: "green",
    HMI: "blue",
    "In Progress": "gold",
    SHIPPED: "green",
    Recieved: "lime",
    Schedule: "cyan",
    RTD: "magenta",
    PNA: "volcano",
    Archived: "default",
  };

  const handleDelete = async (orderId) => {
    try {
      await API.delete(`/easyshiporders/delete/${orderId}`);
      message.success("Order deleted successfully");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete order");
    }
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
      title: "Last Mile Partner",
      dataIndex: "lastmilePartner",
      key: "lastmilePartner",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Last Mile Tracking ID",
      dataIndex: "lastmileTrakingId",
      key: "lastmileTrakingId",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = statusTagColors[status] || "default";
        return (
          <Tag
            color={color}
            style={{
              borderRadius: "999px",
              padding: "0 12px",
              fontWeight: 500,
              textTransform: "capitalize",
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
        <Popconfirm
          title="Are you sure you want to delete this order?"
          onConfirm={() => handleDelete(record._id)} // call delete handler
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
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
        rowClassName={(record) => getRowClassName(record.status)}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default AdminEasyShipAll;
