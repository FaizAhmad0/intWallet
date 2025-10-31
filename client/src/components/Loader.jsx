// components/Loader.jsx
import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader">
        <img src="/logo.png" alt="Saumic Craft Logo" className="logo-center" />
      </div>
      <p className="loading-text italic">
        Loading<span className="dots"></span>
      </p>
    </div>
  );
};

export default Loader;
