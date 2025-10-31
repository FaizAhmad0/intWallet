import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

const NewOrders = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/all?page=1&limit=1");
      setTotalOrders(res.data.total);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClick = () => {
    navigate("/view-all-orders?tab=total");
  };

  return (
    <div
      className="flex items-center p-4 rounded-xl border bg-white space-x-4 w-full transition duration-300 hover:cursor-pointer"
      style={{ transition: "box-shadow 0.3s ease" }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(169, 243, 173, 0.9)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="bg-green-100 rounded-full p-3">
        <FileText className="text-green-600 w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">New Orders to be Processed</p>
        <p className="text-xl font-semibold text-gray-800">
          {loading ? "..." : totalOrders}
        </p>
      </div>
    </div>
  );
};

export default NewOrders;
