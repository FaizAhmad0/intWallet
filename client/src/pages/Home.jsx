import React, { useEffect, useRef, useState } from "react";
import { Card, Row, Col, Button, Form, Input, Modal, message } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import "./Home.css";
import {
  LeftOutlined,
  PlayCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "../components/Footer";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const { Meta } = Card;
const Home = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300; // Adjust the value as needed
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 340; // Adjust the value as needed
    }
  };
  useEffect(() => {
    AOS.init({ duration: 1000 });
    const handleScroll = () => {
      if (window.scrollY > 0) {
      } else {
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const sellers = [
    {
      name: "Name 1",
      state: "State 1",
      gms: 50000,
      earnings: "$2000",
      tier: "Gold",
    },
    {
      name: "Name 2",
      state: "State 2",
      gms: 60000,
      earnings: "$2500",
      tier: "Platinum",
    },
    {
      name: "Name 3",
      state: "State 3",
      gms: 70000,
      earnings: "$3000",
      tier: "Silver",
    },
    {
      name: "Name 4",
      state: "State 4",
      gms: 80000,
      earnings: "$3500",
      tier: "Bronze",
    },
    {
      name: "Name 5",
      state: "State 5",
      gms: 90000,
      earnings: "$4000",
      tier: "Diamond",
    },
    {
      name: "Name 5",
      state: "State 5",
      gms: 90000,
      earnings: "$4000",
      tier: "Diamond",
    },
  ];

  const pricingData = [
    {
      title: "Bronze",
      gms: "35000+ GMS",
      listingsIn: "70 Exclusive Listings on Amazon.in",
      listingsCom: "70 Exclusive Listings on Amazon.com",
      strategy: "ATR strategy",
    },
    {
      title: "Silver",
      gms: "55000+ GMS",
      listingsIn: "150 Exclusive Listings on Amazon.in",
      listingsCom: "150 Exclusive Listings on Amazon.com",
      strategy: "ATR strategy",
    },
    {
      title: "Gold",
      gms: "100000+ GMS",
      listingsIn: "300 Exclusive Listings on Amazon.in",
      listingsCom: "300 Exclusive Listings on Amazon.com",
      strategy: "ATR strategy",
    },
    {
      title: "Platinum",
      gms: "150000+ GMS",
      listingsIn: "500 Exclusive Listings on Amazon.in",
      listingsCom: "500 Exclusive Listings on Amazon.com",
      strategy: "ATR strategy",
    },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleGetStartedClick = () => {
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      message.error("Session expired or not logged in. Please log in again!");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.clear();
        navigate("/");
        message.error("Session expired. Please log in again!");
        return;
      }

      // ✅ Token is valid → redirect based on role
      switch (role) {
        case "user":
          navigate("/user-order");
          break;
        case "manager":
          navigate("/manager-dash");
          break;
        case "admin":
          navigate("/admin-dash");
          break;
        case "dispatch":
          navigate("/dispatch-dash");
          break;
        case "supervisor":
          navigate("/supervisor-dash");
          break;
        case "shippingmanager":
          navigate("/shippingmanager-dash");
          break;
        case "accountant":
          navigate("/accountant-dash");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.clear();
      navigate("/");
      message.error("Session expired or not logged in. Please log in again!");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div id="home" className="banner">
        <div className="content" data-aos="zoom-in">
          <h1 className="heading">Better Solutions For Your Business</h1>
          <p className="subheading">
            We are a team of talented designers making websites with Bootstrap
          </p>
          <div className="buttons">
            <Button
              type="primary"
              onClick={handleGetStartedClick}
              size="large"
              className="get-started"
            >
              Get Started
            </Button>
            <Button
              type="default"
              size="large"
              icon={<PlayCircleOutlined />}
              className="watch-video"
              onClick={showModal}
            >
              Watch Video
            </Button>
            <Modal
              title="Watch Video"
              visible={isModalVisible}
              onCancel={handleCancel}
              footer={null}
              width={800}
            >
              <iframe
                width="100%"
                height="450"
                src="https://www.youtube.com/embed/Rz9Jbj00VPA?autoplay=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video Player"
              ></iframe>
            </Modal>
          </div>
        </div>
        <div className="banner-image" data-aos="zoom-in">
          <img
            src="https://yogeshswami1.github.io/Wallet_portal/assets/img/hero-img.png"
            alt="Business Solutions"
          />
        </div>
      </div>

      {/* tier section */}
      <div
        id="tier"
        className="pricing-section"
        data-aos="fade-up"
        style={{ padding: "50px 20px" }}
      >
        <h2
          className="pricing-title"
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          TIER
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "40px",
            color: "#6c757d",
          }}
        >
          Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
          consectetur velit
        </p>
        <Row gutter={[16, 16]} justify="center">
          {pricingData.map((item, index) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={6}
              key={index}
              data-aos="flip-right"
              data-aos-delay={`${index * 100}`}
              className="pricing-card"
            >
              <Card
                hoverable
                style={{
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  padding: "20px",
                  border: "1px solid #e5e5e5",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                bodyStyle={{ textAlign: "left", fontSize: "16px" }}
                className="pricing-card-inner"
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {item.title}
                </h3>
                <h2
                  style={{
                    color: "rgb(71,178,228)",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.gms}
                </h2>
                <p style={{ marginBottom: "8px" }}>
                  <strong>
                    {" "}
                    <CheckCircleOutlined
                      style={{ color: "rgb(71,178,228)" }}
                    />{" "}
                    {item.listingsIn}
                  </strong>
                </p>
                <p style={{ marginBottom: "8px" }}>
                  {" "}
                  <strong>
                    <CheckCircleOutlined style={{ color: "rgb(71,178,228)" }} />{" "}
                    &nbsp;
                  </strong>
                  {item.listingsCom}
                </p>
                <p style={{ marginBottom: "8px" }}>
                  {" "}
                  <strong>
                    <CheckCircleOutlined style={{ color: "rgb(71,178,228)" }} />{" "}
                    &nbsp;
                  </strong>
                  {item.strategy}
                </p>
                <Button
                  type="primary"
                  style={{
                    marginTop: "20px",
                    width: "100%",
                    backgroundColor: "rgb(71,178,228)",
                    borderColor: "#00b0ff",
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  View More
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* top seller section */}
      <div id="top-seller" data-aos="fade-up" style={{ padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>TOP SELLERS</h2>
        <Row gutter={[16, 16]} justify="center">
          {sellers.map((seller, index) => (
            <Col xs={24} sm={12} md={8} lg={4} key={index}>
              <div data-aos="fade-up" data-aos-delay={`${index * 100}`}>
                <Card hoverable>
                  <Meta
                    title={seller.name}
                    description={
                      <>
                        <p>State: {seller.state}</p>
                        <p>Total Gms: {seller.gms}</p>
                        <p>Estimated Earning: {seller.earnings}</p>
                        <p>Tier: {seller.tier}</p>
                      </>
                    }
                  />
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* product section */}
      <div id="top-product" data-aos="fade-up" className="carousel-container">
        <h2 className="carousel-title">Featured Products</h2>
        <p className="carousel-subtitle">
          Explore our top-selling products that our customers love
        </p>

        <div className="carousel-wrapper">
          <Button
            className="carousel-button-left"
            icon={<LeftOutlined />}
            onClick={scrollLeft}
          />
          <div className="carousel-content" ref={carouselRef}>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/06/CPP07911-Large.jpeg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/06/FPGEGz.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/03/5G7lsv.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/03/Z4xZps.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/06/CiTIjM.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/08/1hwIIC.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/07/e7wwmP.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
            <Card
              className="product-card"
              hoverable
              cover={
                <img
                  alt="Product 4"
                  src="https://gallery.saumiccraft.com/wp-content/uploads/2024/03/RW1uGQ.jpg"
                  className="product-image"
                />
              }
              data-aos="fade-up"
            >
              <Card.Meta title="Product 4" description="$499.99" />
            </Card>
          </div>
          <Button
            className="carousel-button-right"
            icon={<RightOutlined />}
            onClick={scrollRight}
          />
        </div>
      </div>

      {/* news letter section */}
      <div className="newsletter-container" data-aos="fade-up">
        <h2 className="newsletter-title">Join Our Newsletter</h2>
        <p className="newsletter-subtitle">
          Subscribe to our newsletter and receive the latest news about our
          products and services!
        </p>

        <Form className="newsletter-form">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email address!" },
            ]}
          >
            <Input
              placeholder="Enter your email"
              className="newsletter-input"
              type="email"
              style={{
                height: "50px",
                width: "400px",
                borderRadius: "25px",
                padding: "0 20px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="newsletter-button"
            style={{
              height: "50px",
              borderRadius: "25px",
              padding: "0 20px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              marginLeft: "-20px",
              marginBottom: "25px",
            }}
          >
            Subscribe
          </Button>
        </Form>
      </div>

      {/* <div>
        <iframe
          sandbox="allow-same-origin allow-scripts"
          src="https://drive.google.com/file/d/1dlCEwXNYu_VpUvxXPlLyvmeb7GwSVWUD/preview"
          frameborder="0"
          width="640"
          height="480"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div> */}

      <Footer />
    </>
  );
};

export default Home;
