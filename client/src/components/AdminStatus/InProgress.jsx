import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const InProgress = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/in-progress?page=1&limit=1");
      setTotalOrders(res.data.total || res.data.orders?.length || 0);
    } catch (err) {
      console.error("Failed to fetch in-progress orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClick = () => {
    navigate("/view-all-orders?tab=inProgress");
  };

  return (
    <div
      className="flex items-center p-4 rounded-xl border bg-white space-x-4 w-full transition duration-300 hover:cursor-pointer"
      style={{ transition: "box-shadow 0.3s ease" }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(203, 231, 254, 0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="bg-blue-100 rounded-full p-3">
        <ClipboardList className="text-blue-600 w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">Orders In Progress</p>
        <p className="text-xl font-semibold text-gray-800">
          {loading ? "..." : totalOrders}
        </p>
      </div>
    </div>
  );
};

export default InProgress;
