import React, { useEffect, useState } from "react";
import { Table, Tag, Card } from "antd";
import UserLayout from "../../layouts/UserLayout";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

const QuickDeliveryOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchOrders = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/easyshiporders/my-orders?page=${page}&limit=${pageSize}`
      );
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize,
        total: res.data.totalCount,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
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
      case "RA":
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
    RA: "cyan",
    RTD: "magenta",
    PNA: "volcano",
    Archived: "default",
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      },
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Final Amaount",
      dataIndex: "finalAmount",
      key: "finalAmount",
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
        const color = statusTagColors[status] || "default";
        const displayText = status === "PNA" ? "In Progress" : status;
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
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Invoice",
      key: "invoice",
      render: (_, record) => {
        const disabled =
          record.status === "NEW" ||
          record.status === "RA" ||
          record.status === "HMI" ||
          record.status === "Archived";

        return (
          <button
            className={`px-4 rounded-full text-white font-semibold ${
              disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                navigate("/invoice", { state: { order: record } });
              }
            }}
          >
            Invoice
          </button>
        );
      },
    },
  ];

  return (
    <UserLayout>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full  px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <h1 className="text-2xl font-bold text-white">
                Total: {pagination.total}
              </h1>
            </div>
          </div>
          <Table
            bordered
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
            rowClassName={(record) => getRowClassName(record.status)}
          />
        </>
      )}
    </UserLayout>
  );
};

export default QuickDeliveryOrders;
