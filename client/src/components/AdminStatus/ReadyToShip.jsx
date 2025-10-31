import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const ReadyToShip = () => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/ready-to-dispatch?page=1&limit=1");
      setTotal(res.data.total || res.data.orders?.length || 0);
    } catch (err) {
      console.error("Failed to fetch RTD orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClick = () => {
    navigate("/view-all-orders?tab=rtd");
  };

  return (
    <div
      className="flex items-center p-4 rounded-xl border bg-white space-x-4 w-full transition duration-300 hover:cursor-pointer"
      style={{
        transition: "box-shadow 0.3s ease",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(231, 196, 251, 0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="bg-purple-100 rounded-full p-3">
        <Truck className="text-purple-600 w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">Orders Ready to Dispatch</p>
        <p className="text-xl font-semibold text-gray-800">
          {loading ? "..." : total}
        </p>
      </div>
    </div>
  );
};

export default ReadyToShip;
