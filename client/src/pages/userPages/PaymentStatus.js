import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import API from "../../utils/api";

const PaymentStatus = () => {
  const [gid, setGid] = useState(null);
  const location = useLocation();

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  useEffect(() => {
    const queryParams = getQueryParams();
    const extractedGid = queryParams.get("gid");

    // Save and display GID
    if (extractedGid) {
      setGid(extractedGid);
      localStorage.setItem("gid", extractedGid);
    }

    // Trigger backend API immediately
    const sendGidToBackend = async () => {
      try {
        const enrollment = localStorage.getItem("enrollment");

        const body = {
          gid: extractedGid,
          enrollment: enrollment,
        };

        console.log("Sending to API:", body);

        const response = await API.post("/wallet/verify-payment", body);

        console.log("Backend Response:", response.data);
      } catch (error) {
        console.error("API error:", error);
      }
    };

    if (extractedGid) sendGidToBackend();
  }, [getQueryParams]);

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-green-100 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-green-700">Payment Status</h2>

        {gid ? (
          <p className="mt-3 text-sm text-green-800">
            Transaction GID: <b>{gid}</b>
          </p>
        ) : (
          <p className="text-gray-700">No GID found.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
