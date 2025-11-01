import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import "./UserLayout.css";
import LayoutNav from "../components/LayoutNav";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import LockIcon from "@mui/icons-material/Lock";
import logoExpanded from "../assets/logo2.png";
import PaidIcon from "@mui/icons-material/Paid";
import logoCollapsed from "../assets/Logoratan.png";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import ArchiveIcon from "@mui/icons-material/Archive";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const { Header, Sider, Content } = Layout;

const DispatchLayout = ({ children }) => {
  const { enrollment } = useParams();
  const [collapsed, setCollapsed] = useState(true); // Initially collapsed
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    if (key === "/") {
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("enrollment");
      navigate(key, {
        state: { message: "Logged out successfully!" },
      });
    } else if (key.startsWith("https://")) {
      // Handle external links
      window.location.href = key;
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        trigger={null}
        breakpoint="md"
        collapsedWidth={80}
        width={200}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          background: "#1F222E",
          zIndex: 1000,
          borderRight: "4px solid #EF4444",
        }}
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <img
            src={collapsed ? logoCollapsed : logoExpanded}
            style={{
              maxWidth: "80%",
              maxHeight: "80px",
              objectFit: "contain",
              margin: "0 auto",
              transition: "all 0.3s ease-in-out",
            }}
            alt="Logo"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            backgroundColor: "black",
          }}
          items={[
            {
              key: "/easyship-order",
              icon: <ShoppingCartIcon />,
              label: "Order",
            },
            // {
            //   key: "/easyship-order",
            //   icon: <AddBusinessIcon />,
            //   label: "Self-Ship Order",
            // },
            {
              key: "/dispatch-all-client",
              icon: <AccountCircleIcon />,
              label: "View Clients",
            },
            {
              key: "/products",
              icon: <LocalMallIcon />,
              label: "Products",
            },
            {
              key: `/dispatch-bulkorder`,
              icon: <SignalCellularAltIcon />,
              label: "Bulk-Order",
            },

            {
              key: "/detail-report",
              icon: <ViewInArIcon />,
              label: "Details Reporting",
            },
            {
              key: "/all-transaction",
              icon: <PaidIcon />,
              label: "All Transaction",
            },

            {
              key: "/",
              icon: <LockIcon />,
              label: "Logout",
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        {/* Header with Navbar */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: "fixed",
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            zIndex: 1,
          }}
        >
          <LayoutNav />
        </Header>

        {/* Main Content Area */}
        <Content
          style={{
            margin: "64px 1px 1px",
            padding: 25,
            minHeight: "calc(100vh - 104px)",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DispatchLayout;
