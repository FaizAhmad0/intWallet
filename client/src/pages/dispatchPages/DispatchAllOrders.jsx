import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, DatePicker } from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { selectClasses } from "@mui/material";
import dayjs from "dayjs";

const DispatchAllOrders = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 100;
  const [dateRange, setDateRange] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/all?page=${page}&limit=${limit}`);
      setOrders(res.data.orders);
      setTotalOrders(res.data.total);
    } catch (err) {
      console.error("Error fetching orders:", err);
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
      const status = "NEW"; // hardcoded status

      const res = await API.get(
        `/orders/search-by-status?status=${status}&from=${from}&to=${to}&page=${page}&limit=${limit}`
      );

      setOrders(res.data.orders || []);
      setTotalOrders(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching filtered orders:", err);
      message.error("Failed to fetch filtered orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchOrders();
    }
  }, [isActive, page]);

  const assignAwb = async () => {
    try {
      setActionLoading(true);
      const selectedShipmentIds = orders
        .filter((order) => selectedRowKeys.includes(order._id))
        .map((order) => order.shipmentId);
      console.log(selectedShipmentIds);

      const res = await API.post("/orders/assign-selected-awb", {
        shipmentIds: selectedShipmentIds,
      });

      message.success("AWB assigned successfully!");
      fetchOrders(); // Refresh the table
      setSelectedRowKeys([]);
    } catch (error) {
      console.error("Error assigning AWB:", error);
      message.error("Failed to assign AWB.");
    } finally {
      setActionLoading(false);
    }
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
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  return (
    <>
      {loading || actionLoading ? (
        <Loader />
      ) : (
        <>
          {selectedRowKeys.length > 0 && (
            <div className="mb-4 flex justify-between items-center">
              <span className="text-gray-600">
                Selected {selectedRowKeys.length} orders
              </span>
              <Button type="primary" onClick={assignAwb}>
                Assign AWB
              </Button>
            </div>
          )}
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
          </div>

          <Table
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            rowSelection={rowSelection}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalOrders,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
            }}
            bordered
            scroll={{ x: "max-content" }}
            className="bg-white rounded-xl shadow"
          />
        </>
      )}
    </>
  );
};

export default DispatchAllOrders;
