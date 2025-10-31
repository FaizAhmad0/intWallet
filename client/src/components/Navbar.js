import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "antd";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    closeMobileMenu();
  };
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => scrollToSection("home")}>
          <img
            style={{ height: "80px", width: "110px", padding: "5px" }}
            src="./logo.png"
            alt=""
          />
        </div>
        <div className="nav-icon" onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <span className="nav-links" onClick={() => scrollToSection("home")}>
              Home
            </span>
          </li>
          <li className="nav-item">
            <span className="nav-links" onClick={() => scrollToSection("tier")}>
              Tier
            </span>
          </li>
          <li className="nav-item">
            <span
              className="nav-links"
              onClick={() => scrollToSection("top-product")}
            >
              Top product
            </span>
          </li>
          <li className="nav-item">
            <span
              className="nav-links"
              onClick={() => scrollToSection("top-seller")}
            >
              Top sellers
            </span>
          </li>
          <li className="nav-item">
            <a
              style={{ textDecoration: "none" }}
              href="https://gallery.saumiccraft.com/"
            >
              <span className="nav-links">Gallery</span>
            </a>
          </li>
          <li className="nav-item">
            <span
              className="nav-links"
              onClick={() => scrollToSection("top-sellers")}
            >
              <Button
                className="login-button"
                onClick={handleLoginClick}
                type="primary"
              >
                Login
              </Button>
            </span>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
