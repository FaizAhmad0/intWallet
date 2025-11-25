import React, { useEffect, useState } from "react";

const PaymentFailed = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  const goToWallet = () => {
    window.location.href = "/wallet";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Animations */}
      <style>
        {`
          @keyframes popupAnim {
            0% { transform: scale(0.4); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes crossAnim {
            from { stroke-dashoffset: 60; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>

      {showPopup && (
        <div
          className="bg-white rounded-2xl shadow-xl p-8 w-11/12 sm:w-96 text-center"
          style={{ animation: "popupAnim 0.35s ease-out" }}
        >
          {/* Red Cross Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 50 50"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 60,
                  strokeDashoffset: 60,
                  animation: "crossAnim 0.5s ease forwards 0.2s",
                }}
              >
                <path d="M15 15 L35 35" />
                <path d="M35 15 L15 35" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
          <p className="text-gray-600 mt-2">
            Your payment could not be completed.
          </p>

          {/* Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={goToWallet}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Done
            </button>

            <button
              onClick={goToWallet}
              className="w-full py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFailed;
