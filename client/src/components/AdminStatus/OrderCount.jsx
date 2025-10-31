import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import API from "../../utils/api";

const OrderCount = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/total?page=1&limit=10000");
      const orders = res.data.orders || [];

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let todayTotal = 0;
      let yesterdayTotal = 0;

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.toDateString() === today.toDateString()) {
          todayTotal++;
        } else if (orderDate.toDateString() === yesterday.toDateString()) {
          yesterdayTotal++;
        }
      });

      setTodayCount(todayTotal);
      setYesterdayCount(yesterdayTotal);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div
      className="flex items-center p-4 rounded-xl border bg-white space-x-4 w-full transition duration-300 hover:cursor-pointer"
      style={{
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(222, 235, 135, 0.8)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="bg-yellow-100 rounded-full p-3"> Orders
        <CalendarDays className="text-yellow-600 w-6 h-6" />
      </div>
      <div className="w-full space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Today:</span>
          <span className="font-semibold text-gray-800">
            {loading ? "..." : todayCount}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Yesterday:</span>
          <span className="font-semibold text-gray-800">
            {loading ? "..." : yesterdayCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderCount;
