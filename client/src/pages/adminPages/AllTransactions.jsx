import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../utils/api";
import { Table, Tag, message } from "antd";
import Loader from "../../components/Loader";

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/admin/all-transactions?page=${page}&limit=${pageSize}`
      );
      setTransactions(res.data.transactions || []);
      setTotal(res.data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching transactions", error);
      message.error("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, []);

  const columns = [
    {
      title: "Enrollment",
      dataIndex: "enrollmentIdAmazon",
      key: "enrollmentIdAmazon",
      render: (text) => text || "-",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span className={record.credit ? "text-green-600" : "text-red-600"}>
          ₹{amount}
        </span>
      ),
    },
    {
      title: "PaymentId",
      dataIndex: "paymentId",
      key: "paymentId",
      render: (text) => <span className="text-blue-600">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "credit",
      key: "credit",
      render: (credit) => (
        <Tag color={credit ? "green" : "red"}>
          {credit ? "Credit" : "Debit"}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white shadow-lg rounded-xl p-4">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="w-full pb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-white">
                  All Transactions
                </h1>
                <h1 className="text-xl font-bold text-white">Total: {total}</h1>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={transactions}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize,
                total,
                onChange: (page) => fetchTransactions(page),
              }}
              bordered
              scroll={{ x: true }}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllTransactions;
