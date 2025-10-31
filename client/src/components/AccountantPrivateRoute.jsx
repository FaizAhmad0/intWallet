import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { message } from "antd";

const AccountantPrivateRoute = () => {
  const [errorShown, setErrorShown] = useState(false); // State to track if error is shown
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [redirect, setRedirect] = useState(false); // State for handling redirection

  useEffect(() => {
    if (!token || role !== "accountant") {
      if (!errorShown) {
        message.error("Access Denied: Please log in to access this page.");
        setErrorShown(true); // Ensure the message is only shown once
        localStorage.clear(); // Clear everything from localStorage
        setRedirect(true); // Trigger redirection
      }
    }
  }, [token, role, errorShown]);

  if (redirect) {
    return <Navigate to="/login" replace />; // Redirect to /
  }

  return <Outlet />; // Render child routes
};

export default AccountantPrivateRoute;
