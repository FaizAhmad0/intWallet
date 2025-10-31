import React, { useEffect } from "react";
import { Row, Col } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Footer.css";

const Footer = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="footer-container" data-aos="fade-up">
      <div className="footer-content">
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <h2>SAUMIC CRAFT</h2>
            <address>
              CROWN MART/Saumic Craft
              <br />
              PLOT NO.-18, SHANKAR VIHAR-E,SANGANER, SAWAI GETOR, JAGATPURA,
              Jaipur, Jaipur, Rajasthan, 302017
              <br />
              <strong>Phone:</strong> +1 5589 55488 55
              <br />
              <strong>Email:</strong> info@example.com
            </address>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <h3>Useful Links</h3>
            <ul className="footer-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About us</a>
              </li>
              <li>
                <a href="/services">Services</a>
              </li>
              <li>
                <a href="/terms">Terms of service</a>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <h3>Our Services</h3>
            <ul className="footer-links">
              <li>
                <a href="/">Web Design</a>
              </li>
              <li>
                <a href="/">Web Development</a>
              </li>
              <li>
                <a href="/">Product Management</a>
              </li>
              <li>
                <a href="/">Marketing</a>
              </li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <h3>Follow Us</h3>
            <p>
              Cras fermentum odio eu feugiat lide par naso tierra videa magna
              derita valies
            </p>
            <div className="social-links">
              <a href="/">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </Col>
        </Row>
      </div>
      <div className="footer-bottom">
        <p>
          © Copyright <strong>Saumic craft</strong>. All Rights Reserved
          <br />
          Powered by <span className="text-red-700 text-lg">&hearts;</span> MFA
        </p>
      </div>
    </div>
  );
};

export default Footer;
