// Wallet.jsx
import React, { useEffect, useState, useRef } from "react";
import CachedIcon from "@mui/icons-material/Cached";
import UserLayout from "../../layouts/UserLayout";
import { Button, Input, message } from "antd";
import Loader from "../../components/Loader";
import API from "../../utils/api";
import Transacrions from "./Transacrions";

const MoneyCounter = ({ amount }) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = amount / (duration / 16);

    const animateCount = () => {
      start = Math.min(start + increment, amount);
      setDisplayAmount(start);
      if (start < amount) requestAnimationFrame(animateCount);
    };

    animateCount();
  }, [amount]);

  return (
    <p className="text-3xl font-bold text-white">
      ₹ {displayAmount.toLocaleString("en-IN")}.00
    </p>
  );
};

const Wallet = () => {
  const [amount, setAmount] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const transactionRef = useRef(null);

  const predefinedAmounts = [2000, 5000, 10000];

  const formatDate = (createdAt) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(createdAt));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddBalance = async () => {
    if (!amount || Number(amount) <= 0)
      return message.error("Please enter a valid amount!");

    try {
      setLoading(true);
      const { data } = await API.post("/wallet/add-balance", {
        amount: Number(amount),
      });

      message.success("Balance added successfully!");
      if (data.paymentURL) window.open(data.paymentURL, "_blank");

      closeModal();
      setAmount("");
      getUserData();
    } catch (error) {
      console.error("Add balance error:", error);
      message.error("Failed to add balance.");
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/user-details");
      setUserData(data.user);
    } catch (error) {
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const scrollToTransactions = () => {
    if (transactionRef.current) {
      transactionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleDownload = async () => {
    try {
      const res = await API.get("/user/download-transactions", {
        responseType: "blob", // important for file download
      });

      // Create blob link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Transaction_History.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      message.error("Failed to download transaction history");
    }
  };

  if (loading) return <Loader />;

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6 pt-0">
        {/* Balance Section */}
        <div className="bg-purple-600 text-white p-4 rounded-lg flex justify-between items-center mb-6 mt-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Wallet Balance</h3>
              <CachedIcon className="cursor-pointer" onClick={getUserData} />
            </div>
            {userData?.amount !== undefined && (
              <MoneyCounter amount={userData.amount} />
            )}
            <button
              onClick={scrollToTransactions}
              className="text-sm underline"
            >
              View Transactions
            </button>
          </div>
          <button
            onClick={openModal}
            className="bg-purple-200 text-black py-2 px-4 rounded-lg hover:bg-purple-300 transition"
          >
            ➕ Add Balance
          </button>
        </div>

        {/* Add Balance Quick Buttons */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-black">
          <h3 className="text-lg font-bold mb-4">Quick Add:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {predefinedAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className="border-2 border-purple-600 py-2 px-4 rounded-lg hover:bg-purple-100 transition"
              >
                ₹{amt.toLocaleString("en-IN")}.00
              </button>
            ))}
          </div>
          <label className="block mb-2 font-semibold">Custom Amount:</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <button
            onClick={handleAddBalance}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full hover:bg-purple-700 transition"
          >
            Proceed
          </button>
        </div>

        {/* Transaction History */}
        <div
          id="transactionHistory"
          ref={transactionRef}
          className="bg-white p-4 rounded-lg shadow-md text-black"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <Button type="primary" onClick={handleDownload}>
              Download Transaction History
            </Button>
          </div>
          <Transacrions />
          {/* <ul className="space-y-2">
            {userData?.transactions
              ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((t, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {t.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${
                      t.credit ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ₹{t.amount.toLocaleString("en-IN")}
                  </p>
                </li>
              ))}
          </ul> */}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">Add Balance</h3>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mb-4"
              />
              <button
                onClick={handleAddBalance}
                className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full hover:bg-purple-700"
              >
                Proceed
              </button>
              <button
                onClick={closeModal}
                className="mt-3 bg-gray-600 text-white py-2 px-4 rounded-lg w-full hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Wallet;
