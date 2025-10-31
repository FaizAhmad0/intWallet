import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

const LayoutNav = () => {
  const location = useLocation(); // Get the current location

  return (
    <Header className="flex items-center justify-between bg-white w-full p-0">
      <div className="logo"></div>
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[location.pathname]} // Set the active menu item based on the current path
        className="flex-grow flex justify-end font-bold"
      >
        <Menu.Item key="/" className="px-4">
          <Link to="/">Home</Link>
        </Menu.Item>
        {localStorage.getItem("role") === "user" ? (
          <Menu.Item key="/user-order" className="px-4">
            <Link to="/user-order">Order</Link>
          </Menu.Item>
        ) : (
          ""
        )}
        <Menu.Item key="/aboutus" className="px-4">
          <Link to="/aboutus">About Us</Link>
        </Menu.Item>
        {localStorage.getItem("role") !== "user" ? (
          <></>
        ) : (
          <Menu.Item key="/wallet" className="px-4">
            <Link to="/wallet">Wallet Money</Link>
          </Menu.Item>
        )}
      </Menu>
    </Header>
  );
};

export default LayoutNav;
