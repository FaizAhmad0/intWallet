import React, { useEffect, useState } from "react";

const PaymentStatus = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  const goToWallet = () => {
    window.location.href = "/wallet";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Animation */}
      <style>
        {`
          @keyframes popupAnim {
            0% { transform: scale(0.4); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes tickAnim {
            from { stroke-dashoffset: 50; }
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>

      {showPopup && (
        <div
          className="bg-white rounded-2xl shadow-xl p-8 w-11/12 sm:w-96 text-center"
          style={{ animation: "popupAnim 0.35s ease-out" }}
        >
          {/* Perfect Professional Tick */}
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 50 50"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: 50,
                  animation: "tickAnim 0.5s ease forwards 0.2s",
                }}
              >
                <path d="M14 27 L22 35 L36 18" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-green-600">
            Payment Successful
          </h2>
          <p className="text-gray-600 mt-2">
            Your payment was completed successfully.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={goToWallet}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
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

export default PaymentStatus;
