import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import AdminAllOrders from "./AdminAllOrders";
import InProgressOrders from "./InProgressOrders";
import AdminRecieved from "./AdminRecieved";
import AdminHMI from "./AdminHMI";
import AdminRTD from "./AdminRTD";
import AdminPNA from "./AdminPNA";
import AdminShipped from "./AdminShipped";

const ArchivedOrders = () => (
  <div className="text-gray-700">Archived orders shown here.</div>
);

const AllOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("total");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "total";
    setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (key) => {
    navigate(`?tab=${key}`);
  };

  return (
    <AdminLayout>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarGutter={32}
        type="line"
        tabBarStyle={{ fontSize: "16px", fontWeight: 800 }}
        items={[
          {
            key: "total",
            label: "Total",
            children: <AdminAllOrders isActive={activeTab === "total"} />,
          },
          {
            key: "inProgress",
            label: "In Progress",
            children: (
              <InProgressOrders isActive={activeTab === "inProgress"} />
            ),
          },
          {
            key: "hmi",
            label: "HMI",
            children: <AdminHMI isActive={activeTab === "hmi"} />,
          },
          {
            key: "received",
            label: "Recieved",
            children: <AdminRecieved isActive={activeTab === "received"} />,
          },

          {
            key: "rtd",
            label: "RTD",
            children: <AdminRTD isActive={activeTab === "rtd"} />,
          },
          {
            key: "pna",
            label: "PNA",
            children: <AdminPNA isActive={activeTab === "pna"} />,
          },
          {
            key: "shipped",
            label: "Shipped",
            children: <AdminShipped isActive={activeTab === "shipped"} />,
          },
          {
            key: "archived",
            label: "Archived",
            children: <ArchivedOrders isActive={activeTab === "archived"} />,
          },
        ]}
      />
    </AdminLayout>
  );
};

export default AllOrders;
