import React, { useEffect, useState } from "react";
import { Table, Tag, message, Button, DatePicker } from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import dayjs from "dayjs";

const AdminRecieved = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const res = await API.get(`/orders/recieved?page=${page}&limit=${limit}`);
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total,
      });
    } catch (err) {
      console.error("Failed to fetch RECEIVED orders", err);
      message.error("Failed to load RECEIVED orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredOrders = async () => {
    try {
      if (dateRange.length !== 2) {
        return message.warning("Please select a date range.");
      }

      setLoading(true);

      const from = dayjs(dateRange[0]).format("YYYY-MM-DD");
      const to = dayjs(dateRange[1]).format("YYYY-MM-DD");
      const status = "Recieved"; // hardcoded status

      const res = await API.get(
        `/orders/search-by-status?status=${status}&from=${from}&to=${to}&page=${pagination.current}&limit=${pagination.pageSize}`
      );

      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total || 0,
      }));
    } catch (err) {
      console.error("Error fetching filtered orders:", err);
      message.error("Failed to fetch filtered orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
    }
  }, [isActive, pagination.current]);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleGenerateLabel = async () => {
    if (selectedRowKeys.length === 0) {
      return message.warning("Please select at least one order");
    }

    const selectedShipmentIds = selectedRowKeys.map((key) => {
      const order = orders.find((o) => o._id === key);
      return order?.shipmentId;
    });

    try {
      const res = await API.post(
        "/orders/generate-label",
        { shipmentIds: selectedShipmentIds },
        { responseType: "blob" } // important for file download
      );

      // Trigger file download
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "labels.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      message.success("Labels downloaded successfully");
      setSelectedRowKeys([]);
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Label generation failed", error);
      message.error("Failed to generate labels");
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
      title: "Total Amount",
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
          color="purple"
          style={{
            borderRadius: "999px",
            padding: "0 12px",
            fontWeight: 500,
          }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                className="bg-blue-600"
                onClick={handleGenerateLabel}
              >
                Download Label ({selectedRowKeys.length})
              </Button>
            )}
          </div>
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {/* <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(val) => setDateRange(val || [])}
                        format="DD/MM/YYYY"
                      />
                      <Button type="primary" onClick={fetchFilteredOrders}>
                        Search
                      </Button> */}
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(val) => {
                if (!val || val.length === 0) {
                  setDateRange([]);
                  fetchOrders(); // Re-fetch all orders when cleared
                } else {
                  setDateRange(val);
                }
              }}
              format="DD/MM/YYYY"
            />
            <Button
              type="primary"
              onClick={fetchFilteredOrders}
              disabled={dateRange.length !== 2}
            >
              Search
            </Button>
            <Button className="font-bold" type="primary">
              Total Orders : {pagination.total}
            </Button>
          </div>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            bordered
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </>
  );
};

export default AdminRecieved;
