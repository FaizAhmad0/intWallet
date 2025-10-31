import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  message,
  Button,
  Modal,
  Input,
  Form,
  Space,
  DatePicker,
} from "antd";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import dayjs from "dayjs";

const InProgressOrders = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [skuInput, setSkuInput] = useState("");

  const fetchOrders = async (page = 1, limit = 100, searchId = "") => {
    setLoading(true);
    try {
      const endpoint = searchId
        ? `/orders/in-progress/search?orderId=${searchId}`
        : `/orders/in-progress?page=${page}&limit=${limit}`;
      const res = await API.get(endpoint);
      setOrders(res.data.orders);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.total || res.data.orders.length,
      });
    } catch (err) {
      console.error("Failed to fetch orders", err);
      message.error("Failed to load in-progress orders");
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
      const status = "In Progress"; // hardcoded status

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
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim()
      );
    }
  }, [isActive, pagination.current]);

  const handleSearch = () => {
    if (!searchOrderId.trim()) {
      message.warning("Please enter an Order ID to search.");
      return;
    }
    fetchOrders(1, pagination.pageSize, searchOrderId.trim());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchOrderId(value);
    if (value.trim() === "") {
      fetchOrders(1, pagination.pageSize);
    }
  };

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize, searchOrderId.trim());
  };

  const handleAddSku = (order) => {
    setSelectedOrder(order);
    setSkuInput("");
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const res = await API.post("/orders/add-sku", {
        shipmentId: selectedOrder.shipmentId,
        enrollment: selectedOrder.enrollment,
        sku: skuInput,
      });

      // Show message from response if it exists, else fallback
      const successMsg = res?.data?.message || "SKU(s) added successfully";
      message.success(successMsg);

      setIsModalVisible(false);
      fetchOrders(
        pagination.current,
        pagination.pageSize,
        searchOrderId.trim()
      );
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Failed to add SKU(s)";
      message.error(errorMsg);
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
        let color = "orange";
        if (status === "Ready to ship") color = "blue";
        else if (status === "In Progress") color = "volcano";

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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAddSku(record)}
        >
          Add SKU
        </Button>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white p-4 rounded-xl shadow">
          <Space className="mb-4" wrap>
            <Input
              placeholder="Search by Order ID"
              value={searchOrderId}
              onChange={handleInputChange}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>

            <div className=" flex flex-wrap gap-2 items-center">
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

      <Modal
        title="Add SKU(s)"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Enter SKU(s) (comma separated if multiple)">
            <Input
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="e.g. SKU123,SKU456"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InProgressOrders;
