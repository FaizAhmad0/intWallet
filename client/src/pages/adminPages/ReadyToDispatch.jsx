import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const ReadyToDispatch = () => {
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
      const res = await API.get(
        `/orders/ready-to-dispatch?page=${page}&limit=${limit}`
      );
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total,
      });
    } catch (err) {
      console.error("Failed to fetch orders", err);
      message.error("Failed to load orders");
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
      title: "Shipment ID",
      dataIndex: "shipmentId",
      key: "shipmentId",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "NEW") color = "green";
        else if (status === "Ready to ship") color = "blue";

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
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            bordered
          />
        </div>
      )}
    </>
  );
};

export default ReadyToDispatch;
