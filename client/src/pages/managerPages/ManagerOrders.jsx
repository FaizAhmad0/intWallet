import React, { useEffect, useState } from "react";
import ManagerLayout from "../../layouts/ManagerLayout";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { Table, Tag, message } from "antd";

const ManagerOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchManagerOrders = async (pageNumber = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await API.get(
        `/orders/manager-orders?page=${pageNumber}&limit=${limit}`
      );
      setOrders(response.data.orders || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerOrders(page, pageSize);
  }, [page, pageSize]);

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const showBalance = async (enrollmentId) => {
    try {
      const response = await API.get(`/users/balance/${enrollmentId}`);
      message.success(`Balance for ${enrollmentId}: ₹${response.data.balance}`);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch balance.");
    }
  };

  const handlePay = async (enrollmentId, orderId, finalAmount) => {
    try {
      await API.post("/transactions/pay", {
        enrollmentId,
        orderId,
        amount: finalAmount,
      });
      message.success("Payment successful. Order marked as RTD.");
      fetchManagerOrders(page, pageSize); // Refresh orders
    } catch (err) {
      console.error(err);
      message.error("Payment failed.");
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
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Total Amount",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (amount) =>
        amount !== undefined && amount !== null ? (
          `₹ ${amount}`
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
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
  ];

  return (
    <ManagerLayout>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-white">All Orders</h1>
              <h1 className="text-2xl font-bold text-white">Total: {total}</h1>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            className="overflow-x-auto"
          />
        </>
      )}
    </ManagerLayout>
  );
};

export default ManagerOrders;
