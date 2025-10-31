import React, { useEffect, useState } from "react";
import { Table, Input, Space, Button, message, Tag, Modal } from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;

const ManagerHMI = ({ isActive }) => {
  const [orders, setOrders] = useState([]);
  const [managers, setManagers] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const status = "HMI";

  const fetchManagers = async (page = 1, pageSize = 100) => {
    try {
      const res = await API.get(
        `/admin/managers?page=${page}&limit=${pageSize}`
      );
      setManagers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch managers", err);
    }
  };

  const fetchOrders = async (page = 1, pageSize = 20, useDate = false) => {
    setLoading(true);
    try {
      const params = { status, page, limit: pageSize };

      if (useDate && dateRange.length === 2) {
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

  const handleSearch = async () => {
    const search = searchText.trim();
    if (!search) return fetchOrders(1, pagination.pageSize);

    setSearchLoading(true);
    try {
      const res = await API.get("/easyshiporders/search", {
        params: { search, status },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: res.data.total || 0,
      }));
    } catch (error) {
      console.error("Search error:", error);
      message.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDateSearch = async (page = 1, limit = pagination.pageSize) => {
    if (!dateRange || dateRange.length !== 2) {
      return message.warning("Please select a valid date range");
    }

    const [start, end] = dateRange;
    setLoading(true);
    try {
      const res = await API.get("/easyshiporders/search-by-date", {
        params: {
          page,
          limit,
          startDate: start.startOf("day").toISOString(),
          endDate: end.endOf("day").toISOString(),
          status,
        },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,

        total: res.data.total || 0,
      }));
    } catch (err) {
      console.error("Date search error:", err);
      message.error("Failed to fetch orders for given date range");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (val.trim() === "") {
      fetchOrders(1, pagination.pageSize);
    }
  };

  const handleTableChange = (paginationInfo, filters) => {
    if (filters.manager && filters.manager.length > 0) {
      const selectedManager = filters.manager[0];

      const filtered = orders.filter((order) => {
        if (typeof order.manager === "string") {
          return order.manager === selectedManager;
        }
        if (order.manager && order.manager.name) {
          return order.manager.name === selectedManager;
        }
        return false;
      });

      setOrders(filtered);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        total: filtered.length,
      }));
      return;
    }

    // default case → normal API fetch
    if (dateRange && dateRange.length === 2) {
      handleDateSearch(paginationInfo.current, paginationInfo.pageSize);
      fetchManagers();
    } else if (searchText.trim()) {
      handleSearch(paginationInfo.current, paginationInfo.pageSize);
      fetchManagers();
    } else {
      fetchOrders(paginationInfo.current, paginationInfo.pageSize);
      fetchManagers();
    }
  };

  const showBalance = async (enrollment) => {
    try {
      const res = await API.get(`/user/balance/${enrollment}`);
      Modal.info({
        title: "User Balance",
        content: <p>₹ {res.data.amount}</p>,
      });
    } catch (err) {
      message.error("Failed to fetch balance");
    }
  };

  const handlePay = async (enrollment, orderId, finalAmount) => {
    try {
      await API.post(`/easyshiporders/pay`, {
        enrollment,
        orderId,
        finalAmount,
      });
      message.success("Payment successful and order updated!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Payment failed");
    }
  };

  const handleArchive = async (orderId) => {
    try {
      const res = await API.put(`/easyshiporders/archive`, { orderId });
      message.success(res.data.message || "Order archived successfully!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error("Failed to archive order");
    }
  };
  const handleRAClick = async (orderId) => {
    try {
      const res = await API.put(`/easyshiporders/return-adjst`, { orderId });
      message.success(res.data.message || "Return Adjust successfully!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error("Failed to return adjust");
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchOrders(pagination.current, pagination.pageSize);
      fetchManagers();
    }
  }, [isActive, pagination.current]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
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
      filters: managers.map((m) => ({
        text: m.name,
        value: m.name,
      })),
      onFilter: (value, record) => {
        // Basic matching logic
        if (typeof record.manager === "string") {
          return record.manager === value;
        }
        if (record.manager && record.manager.name) {
          return record.manager.name === value;
        }
        return false;
      },
      render: (manager) => {
        if (typeof manager === "string") return manager;
        if (manager && manager.name) return manager.name;
        return <span className="text-gray-400">N/A</span>;
      },
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
      render: (amount) => `₹ ${amount}`,
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
      title: "SKU",
      dataIndex: "items",
      key: "items",
      render: (items) => {
        if (!items || items.length === 0) {
          return <span className="text-gray-400">N/A</span>;
        }
        const skus = items
          .map((item) => item.sku)
          .filter(Boolean)
          .join(", ");
        return <span>{skus}</span>;
      },
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
          <Tag color={color} style={{ borderRadius: 999, padding: "0 12px" }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 flex-wrap">
          <Button type="primary" onClick={() => showBalance(record.enrollment)}>
            Show Balance
          </Button>
          <Button
            type="default"
            onClick={() =>
              handlePay(record.enrollment, record._id, record.finalAmount)
            }
          >
            Pay
          </Button>
          <Button
            danger
            type="dashed"
            onClick={() => handleArchive(record._id)}
          >
            Archive
          </Button>
          <Button
            danger
            type="dashed"
            onClick={() => handleRAClick(record._id)}
          >
            RA
          </Button>
        </div>
      ),
    },
  ];

  return loading ? (
    <Loader />
  ) : (
    <div className="bg-white rounded-xl shadow">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search by Order ID, Tracking ID, or Enrollment"
          allowClear
          value={searchText}
          onChange={handleInputChange}
          style={{ width: 320 }}
        />
        <Button type="primary" loading={searchLoading} onClick={handleSearch}>
          Search
        </Button>
        <RangePicker
          format="DD/MM/YYYY"
          value={dateRange}
          onChange={(dates) => {
            setDateRange(dates || []);
            if (!dates || dates.length === 0) {
              fetchOrders(1, pagination.pageSize);
            }
          }}
          allowClear
        />
        <Button type="primary" onClick={handleDateSearch}>
          Search by Date
        </Button>
        <Button type="default">Total Orders: {pagination.total}</Button>
      </Space>
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
  );
};

export default ManagerHMI;
