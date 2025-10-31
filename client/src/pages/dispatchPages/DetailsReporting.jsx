import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import DispatchLayout from "../../layouts/DispatchLayout";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const DetailsReporting = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const res = await API.get("/easyshiporders/get-all-order", {
        params: { page, limit },
      });
      setOrders(res.data.orders || []);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || 0,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize);
  };

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { title: "Enrollment", dataIndex: "enrollment", key: "enrollment" },
    { title: "Brand Name", dataIndex: "brandName", key: "brandName" },
    { title: "Manager", dataIndex: "manager", key: "manager" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
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
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <DispatchLayout>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-xl shadow p-4">
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
      )}
    </DispatchLayout>
  );
};

export default DetailsReporting;
