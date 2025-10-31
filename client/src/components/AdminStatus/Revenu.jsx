import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API from "../../utils/api";

const Revenu = () => {
  const [statusData, setStatusData] = useState([]);

  const COLORS = [
    "#0088FE", // HMI
    "#00C49F", // NEW
    "#FFBB28", // IN PROGRESS
    "#FF8042", // RECEIVED
    "#FF6347", // RTD
    "#A569BD", // PNA
    "#2ECC71", // SHIPPED
    "#D35400", // ARCHIVED
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/total?page=1&limit=10000");
        const orders = res.data.orders || [];

        const statusCount = {
          HMI: 0,
          NEW: 0,
          "IN PROGRESS": 0,
          RECEIVED: 0,
          RTD: 0,
          PNA: 0,
          SHIPPED: 0,
          ARCHIVED: 0,
        };

        orders.forEach((order) => {
          const status = order.status?.toUpperCase();
          if (status && statusCount.hasOwnProperty(status)) {
            statusCount[status]++;
          }
        });

        const pieData = Object.entries(statusCount).map(([key, value]) => ({
          name: key,
          value,
        }));

        setStatusData(pieData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex justify-center mb-6 w-full h-[300px] bg-white rounded-lg shadow-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
            label
          >
            {statusData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Revenu;
