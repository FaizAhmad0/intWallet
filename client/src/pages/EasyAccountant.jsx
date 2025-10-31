import React, { useEffect, useState } from "react";
import { Table, Tag, message, Input, Button, Space, DatePicker } from "antd";
import API from "../utils/api";
import Loader from "../components/Loader";
import AccountantLayout from "../layouts/AccountantLayout";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;

const EasyAccountant = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 500,
    total: 0,
  });

  const fetchOrders = async (
    page = 1,
    limit = 500,
    trackingId = "",
    startDate = null,
    endDate = null
  ) => {
    setLoading(true);
    try {
      let endpoint = `/easyshiporders/shipped?page=${page}&limit=${limit}`;
      if (trackingId) {
        endpoint = `/easyshiporders/shipped/search?trackingId=${trackingId}`;
      } else if (startDate && endDate) {
        endpoint = `/easyshiporders/shipped/date-range?start=${startDate}&end=${endDate}`;
      }

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

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, [pagination.current]);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    if (trackingId.trim()) {
      fetchOrders(1, 500, trackingId.trim());
    } else if (dateRange.length === 2) {
      const start = dateRange[0].startOf("day").toISOString();
      const end = dateRange[1].endOf("day").toISOString();
      fetchOrders(1, 500, "", start, end);
    } else {
      message.warning("Please enter tracking ID or select a date range.");
    }
  };

  const handleDownload = () => {
    if (orders.length === 0) return message.warning("No data to download.");

    const data = [];

    orders.forEach((order) => {
      const buyerState = (order.state || "").trim().toLowerCase();
      const isIntraState = buyerState === "rajasthan";

      order.items.forEach((item) => {
        const gstAmount =
          ((item.price + (item.shipping || 0)) * (item.gstRate || 0)) / 100;
        const cgst = isIntraState ? gstAmount / 2 : 0;
        const sgst = isIntraState ? gstAmount / 2 : 0;
        const igst = isIntraState ? 0 : gstAmount;

        data.push({
          "Invoice No": `SC${order.invoice}`,
          "Order Date": new Date(order.date).toLocaleDateString("en-GB"),
          Enrollment: order.enrollment,
          GST: order.gst,
          "Brand Name": order.brandName,
          Manager: order.manager,
          Add: order.add,
          Pincode: order.pincode,
          "Order ID": order.orderId,
          "Shipment ID": order.shipmentId,
          "Tracking ID": order.trackingId || "N/A",
          "Delivery Partner": order.deliveryPartner || "N/A",
          Status: order.status,
          "Item Name": item.name,
          SKU: item.sku,
          "Item Price": item.price,
          "Shipping Charges": item.shipping,
          "GST Rate (%)": item.gstRate,
          Quantity: item.quantity,
          Dimension: item.dimension,
          Weight: item.weight,
          State: order.state || "N/A",
          CGST: cgst.toFixed(2),
          SGST: sgst.toFixed(2),
          IGST: igst.toFixed(2),
          "Final Amount": order.finalAmount,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipped Orders");
    XLSX.writeFile(workbook, "Shipped_Orders_GST.xlsx");
  };

  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoice",
      key: "invoice",
      render: (invoice) => `SC${invoice}`,
    },
    {
      title: "Order Date",
      dataIndex: "date",
      key: "date",
      render: (text) =>
        text ? new Date(text).toLocaleDateString("en-GB") : "N/A",
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
      title: "Final Amount",
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
          style={{ borderRadius: "999px", padding: "0 12px", fontWeight: 500 }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <AccountantLayout>
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
                  fetchOrders(1, pagination.pageSize);
                }
              }}
              allowClear
              className="w-64"
            />
            <RangePicker
              onChange={(values) => setDateRange(values || [])}
              className="w-80"
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button onClick={handleDownload} type="default">
              Download Excel
            </Button>
            <Button className="font-bold" type="primary">
              Total Orders : {pagination.total}
            </Button>
          </Space>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            bordered
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </AccountantLayout>
  );
};

export default EasyAccountant;
