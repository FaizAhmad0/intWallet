import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Empty, Card } from "antd";
import Loader from "../../components/Loader";
import API from "../../utils/api";

const { Title } = Typography;

const Transacrions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/user/transactions?page=${page}&limit=${pageSize}`
      );
      setTransactions(res.data.transactions);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Enrollment",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) =>
        record.credit ? (
          <Tag color="green">Credit</Tag>
        ) : record.debit ? (
          <Tag color="red">Debit</Tag>
        ) : (
          <Tag color="gray">N/A</Tag>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : transactions.length === 0 ? (
        <Empty description="No transactions found" />
      ) : (
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalCount,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
          }}
          bordered
          className="rounded-xl"
        />
      )}
    </>
  );
};

export default Transacrions;
