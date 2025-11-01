import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  message,
  Tag,
  Modal,
  Form,
  Select,
} from "antd";
import dayjs from "dayjs";
import API from "../../utils/api";
import Loader from "../../components/Loader";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;

const { Option } = Select;

const ManagerNew = ({ isActive }) => {
  const [dateRange, setDateRange] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [skuInput, setSkuInput] = useState("");
  const [buttonLoadingId, setButtonLoadingId] = useState(null); // for per-row button loading

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

  const status = "NEW";

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

  const fetchSkus = async () => {
    try {
      const res = await API.get("/products/allsku");
      setSkuList(res.data.skus || []);
    } catch (err) {
      console.error("Failed to fetch SKUs", err);
      message.error("Failed to load SKUs");
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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (val.trim() === "") {
      fetchOrders(1, pagination.pageSize);
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

  useEffect(() => {
    if (isActive) {
      fetchSkus();
      fetchManagers();
      fetchOrders(pagination.current, pagination.pageSize);
    }
  }, [isActive, pagination.current]);

  const handleAddSkuClick = (order) => {
    setSelectedOrder(order);
    setSkuInput("");
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!selectedOrder) return;
    setModalLoading(true);

    setButtonLoadingId(selectedOrder._id);
    try {
      const res = await API.post("/easyshiporders/add-sku", {
        shipmentId: selectedOrder._id,
        enrollment: selectedOrder.enrollment,
        sku: skuInput, // comma-separated string
      });

      message.success(res.data?.message || "SKU(s) added successfully");
      setIsModalVisible(false);
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to add SKU(s)");
    } finally {
      setButtonLoadingId(null);
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this order?",
      content: `Order ID: ${record.orderId || record._id}`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setButtonLoadingId(record._id); // start loading
          await API.delete(`/easyshiporders/${record._id}`); // call backend
          message.success("Order deleted successfully");
          fetchOrders(pagination.current, pagination.pageSize); // refresh table
        } catch (err) {
          console.error(err);
          message.error(
            err?.response?.data?.message || "Failed to delete order"
          );
        } finally {
          setButtonLoadingId(null);
        }
      },
    });
  };

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
      title: "Tracking ID",
      dataIndex: "trackingId",
      key: "trackingId",
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
      render: (status) => (
        <Tag color="green" style={{ borderRadius: 999, padding: "0 12px" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            loading={buttonLoadingId === record._id}
            onClick={() => handleAddSkuClick(record)}
          >
            Add SKU
          </Button>
          <Button
            className="ml-4"
            type="primary"
            danger
            size="small"
            loading={buttonLoadingId === record._id}
            onClick={() => handleDeleteClick(record)}
          >
            Delete
          </Button>
        </>
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

      {/* Add SKU Modal */}
      <Modal
        title="Add SKU(s)"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Add"
        confirmLoading={modalLoading}
      >
        <Form layout="vertical">
          <Form.Item label="Enter SKU(s)">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Type or select SKU(s)"
              value={skuInput.split(",").filter(Boolean)}
              onChange={(value) => setSkuInput(value.join(","))}
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {skuList.map((item) => (
                <Option key={item.sku} value={item.sku}>
                  {item.sku}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerNew;
