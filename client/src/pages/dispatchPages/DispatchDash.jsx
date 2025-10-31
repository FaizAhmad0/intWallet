import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import DispatchLayout from "../../layouts/DispatchLayout";
import DispatchAllOrders from "./DispatchAllOrders";
import InProgressOrders from "./InProgressOrders";
import DispatchRTD from "./DispatchRTD";
import DispatchHMI from "./DispatchHMI";
import DispatchPNA from "./DispatchPNA";
import DispatchShipped from "./DispatchShipped";
import DispatchRecieved from "./DispatchRecieved";
import Schedule from "./Schedule";
import DispatchArchived from "./DispatchArchived";
import All from "./All";

const DispatchDash = () => {
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
    <DispatchLayout>
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
            children: <DispatchAllOrders isActive={activeTab === "total"} />,
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
            children: <DispatchHMI isActive={activeTab === "hmi"} />,
          },
          {
            key: "schedule",
            label: "Schedule",
            children: <Schedule isActive={activeTab === "schedule"} />,
          },
          {
            key: "received",
            label: "Recieved",
            children: <DispatchRecieved isActive={activeTab === "received"} />,
          },

          {
            key: "rtd",
            label: "RTD",
            children: <DispatchRTD isActive={activeTab === "rtd"} />,
          },
          {
            key: "pna",
            label: "PNA",
            children: <DispatchPNA isActive={activeTab === "pna"} />,
          },
          {
            key: "shipped",
            label: "Shipped",
            children: <DispatchShipped isActive={activeTab === "shipped"} />,
          },
          {
            key: "archived",
            label: "Archived",
            children: <DispatchArchived isActive={activeTab === "archived"} />,
          },
          {
            key: "all",
            label: "All",
            children: <All isActive={activeTab === "all"} />,
          },
        ]}
      />
    </DispatchLayout>
  );
};

export default DispatchDash;
