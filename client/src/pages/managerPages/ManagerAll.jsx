import React, { useEffect, useState } from "react";
import { Button, DatePicker, Table, Tag, message, Space } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const { RangePicker } = DatePicker;

const ManagerAll = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [dateRange, setDateRange] = useState([]);

  const status = ""; // all

  const fetchOrders = async (page = 1, pageSize = 50) => {
    setLoading(true);
    try {
      const params = { status, page, limit: pageSize };

      if (dateRange.length === 2) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const res = await API.get("/manager/orders", { params });

      setOrders(res.data.orders || []);
      setPagination({
        current: page,
        pageSize,
        total: res.data.total || 0,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch manager orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, dateRange]);

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

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    { title: "Enrollment", dataIndex: "enrollment", key: "enrollment" },
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
      title: "Order Type",
      dataIndex: "orderType",
      key: "orderType",
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
  ];

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

  return loading ? (
    <Loader />
  ) : (
    <>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          allowClear
          value={dateRange}
          onChange={(values) => {
            setDateRange(values || []);
            if (!values || values.length === 0) {
              // immediately fetch current page orders when cleared
              fetchOrders(pagination.current, pagination.pageSize);
            }
          }}
        />
        <Button>Total Orders: {pagination.total}</Button>
      </Space>

      <Table
        bordered
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        rowClassName={(record) => getRowClassName(record.status)}
        onChange={(pag) => fetchOrders(pag.current, pag.pageSize)}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};

export default ManagerAll;
