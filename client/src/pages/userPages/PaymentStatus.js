import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import API from "../../utils/api"; // ✅ Your custom axios instance
import "./PaymentStatus.css"; // Optional: for animation or styling

const PaymentStatus = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = getQueryParams();
      const paymentRequestId = queryParams.get("payment_request_id");
      const paymentId = queryParams.get("payment_id");

      if (paymentRequestId && paymentId) {
        try {
          const response = await API.post("/wallet/verify-payment", {
            paymentRequestId,
            paymentId,
          });

          if (response.data.success) {
            message.success("Payment Successful!");
            setStatus("success");

            // Redirect after a short delay
            setTimeout(() => {
              navigate("/wallet");
            }, 100);
          } else {
            message.error("Payment Failed or Cancelled.");
            setStatus("failed");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          message.error("Error verifying payment, please try again.");
          setStatus("error");
        }
      } else {
        message.error("Invalid payment details.");
        setStatus("invalid");
      }

      setLoading(false);
    };

    verifyPayment();
  }, [getQueryParams, navigate]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      {status === "success" && (
        <div className="bg-green-100 p-6 rounded-lg text-center success-animation">
          <h2 className="text-2xl font-bold text-green-700">
            Payment Successful!
          </h2>
          <p>Your balance has been updated.</p>
        </div>
      )}
      {status === "failed" && (
        <div className="bg-red-100 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-700">Payment Failed!</h2>
          <p>Please try again.</p>
        </div>
      )}
      {status === "error" && (
        <div className="bg-yellow-100 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-700">
            Error Occurred!
          </h2>
          <p>There was an error verifying your payment.</p>
        </div>
      )}
      {status === "invalid" && (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-700">Invalid Payment!</h2>
          <p>The payment details provided are invalid.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
