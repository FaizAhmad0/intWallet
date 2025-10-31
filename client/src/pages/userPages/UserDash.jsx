import React, { useEffect, useState } from "react";
import { Table, Tag, Card } from "antd";
import UserLayout from "../../layouts/UserLayout";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

const UserDash = () => {
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
        `/orders/my-orders?page=${page}&limit=${pageSize}`
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
      title: "Amazon SKU",
      dataIndex: "asku",
      key: "asku",
      render: (text) => text || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "NEW" ? "green" : "default";
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
      title: "Invoice",
      key: "invoice",
      render: (_, record) => (
        <button
          className={`px-4 py-1 rounded-full text-white font-semibold ${
            record.status === "SHIPPED"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={record.status !== "SHIPPED"}
          onClick={() => {
            if (record.status === "SHIPPED") {
              navigate("/invoice", { state: { order: record } });
            }
          }}
        >
          Invoice
        </button>
      ),
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
          />
        </>
      )}
    </UserLayout>
  );
};

export default UserDash;
