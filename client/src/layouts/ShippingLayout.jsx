import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserLayout.css";
import LayoutNav from "../components/LayoutNav";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LockIcon from "@mui/icons-material/Lock";
import logoExpanded from "../assets/logo2.png";
import logoCollapsed from "../assets/Logoratan.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const { Header, Sider, Content } = Layout;

const ShippingLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true); // Initially collapsed
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Function to expand sidebar on hover when not on mobile
    const handleMouseEnter = () => {
      if (!isMobile) setCollapsed(false);
    };

    // Function to collapse sidebar on mouse leave when not on mobile
    const handleMouseLeave = () => {
      if (!isMobile) setCollapsed(true);
    };

    // Attach hover events when the screen is wider than 768px
    if (!isMobile) {
      document
        .querySelector(".ant-layout-sider")
        ?.addEventListener("mouseenter", handleMouseEnter);
      document
        .querySelector(".ant-layout-sider")
        ?.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (!isMobile) {
        document
          .querySelector(".ant-layout-sider")
          ?.removeEventListener("mouseenter", handleMouseEnter);
        document
          .querySelector(".ant-layout-sider")
          ?.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isMobile]);

  const handleMenuClick = ({ key }) => {
    if (key === "/") {
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate(key, {
        state: { message: "Logged out successfully!" },
      });
    } else if (key.startsWith("https://")) {
      window.location.href = key;
    } else {
      navigate(key);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
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
          display: isMobile && collapsed ? "none" : "block", // Hide on mobile
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
          style={{ backgroundColor: "black" }}
          items={[
            {
              key: "/shippingmanager-dash",
              icon: <ShoppingCartIcon />,
              label: "Orders",
            },
            {
              key: "/shipped",
              icon: <LocalShippingIcon />,
              label: "Shipped",
            },

            { key: "/", icon: <LockIcon />, label: "Logout" },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{ marginLeft: isMobile && collapsed ? 0 : collapsed ? 80 : 200 }}
      >
        {/* Header with Navbar */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: "fixed",
            width: `calc(100% - ${
              isMobile && collapsed ? 0 : collapsed ? 80 : 200
            }px)`,
            zIndex: 1,
          }}
        >
          <Button
            onClick={toggleSidebar}
            style={{
              margin: "0 16px",
              display: isMobile ? "block" : "none", // Show button only on mobile
              position: "relative",
              top: "20px",
            }}
          >
            {collapsed ? <MenuIcon /> : <CloseIcon />}
          </Button>
          {!isMobile && <LayoutNav />}
        </Header>

        {/* Main Content Area */}
        <Content
          style={{
            margin: "40px 1px 1px",
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

export default ShippingLayout;
