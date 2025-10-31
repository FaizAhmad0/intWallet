import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const EasyshipPNA = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const status = "PNA";

  const fetchOrders = async (page = 1, limit = 100) => {
    try {
      setLoading(true);
      const res = await API.get("/easyshiporders/get-all-order", {
        params: { page, limit, status },
      });
      setTotalOrders(res.data.total || res.data.orders?.length || 0);
    } catch (err) {
      console.error("Failed to fetch PNA orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClick = () => {
    navigate("/view-easyship-orders?tab=pna");
  };

  return (
    <div
      className="flex items-center p-4 rounded-xl border bg-white space-x-4 w-full transition duration-300 hover:cursor-pointer"
      style={{ transition: "box-shadow 0.3s ease" }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(252, 250, 180, 0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="bg-yellow-100 rounded-full p-3">
        <PackageCheck className="text-yellow-600 w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">PNA Orders</p>
        <p className="text-xl font-semibold text-gray-800">
          {loading ? "..." : totalOrders}
        </p>
      </div>
    </div>
  );
};

export default EasyshipPNA;
