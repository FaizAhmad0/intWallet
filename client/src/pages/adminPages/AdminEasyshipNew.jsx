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

const { Option } = Select;

const AdminEasyshipNew = ({ isActive }) => {
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

  const status = "NEW";

  const fetchOrders = async (page = 1, limit = 100) => {
    setLoading(true);
    try {
      const res = await API.get("/easyshiporders/get-all-order", {
        params: { page, limit, status },
      });
      setOrders(res.data.orders || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: res.data.total || 0,
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch EasyShip New orders");
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

  const handleTableChange = (paginationInfo) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize);
  };

  useEffect(() => {
    if (isActive) {
      fetchSkus();
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
    }
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
        <Button
          type="primary"
          size="small"
          loading={buttonLoadingId === record._id}
          onClick={() => handleAddSkuClick(record)}
        >
          Add SKU
        </Button>
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

export default AdminEasyshipNew;
