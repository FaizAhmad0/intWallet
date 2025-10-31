import React, { useState, useEffect } from "react";
import { Button, Upload, message, Typography, Input } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import DispatchLayout from "../../layouts/DispatchLayout";
import ProductTable from "../../components/ProductTable";
import API from "../../utils/api";
import Loader from "../../components/Loader";

const { Title } = Typography;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sku, setSku] = useState("");

  const fetchProducts = async (page = 1, searchSku = sku) => {
    try {
      setLoading(true);
      const url = searchSku
        ? `/products?sku=${searchSku}`
        : `/products?page=${page}&limit=20`;

      const res = await API.get(url);
      setProducts(res.data.products);
      setTotalProducts(res.data.total || res.data.products.length);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch products");
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "/sampleProduct.xlsx";
    link.setAttribute("download", "sampleProduct.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        setLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        await API.post("/products/upload", { products: jsonData });
        message.success("Products uploaded successfully");
        fetchProducts(currentPage); // refresh current page
      } catch (error) {
        console.error(error);
        message.error("Failed to upload or fetch products");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  return (
    <DispatchLayout>
      <div className="w-full mb-2 px-4 bg-gradient-to-r from-blue-500 to-red-300 shadow-lg rounded-lg">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-white">All Products</h1>
          <h1 className="text-2xl font-bold text-white">
            Total: {totalProducts}
          </h1>
        </div>
      </div>

      {/* SKU Search and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <Input.Search
          placeholder="Enter SKU to search"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onSearch={() => fetchProducts(1, sku)}
          enterButton="Search"
          allowClear
          style={{ maxWidth: 300 }}
        />

        <div className="flex gap-4">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadSample}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download Sample
          </Button>

          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            accept=".xlsx, .xls"
          >
            <Button
              icon={<UploadOutlined />}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Upload Products
            </Button>
          </Upload>
        </div>
      </div>

      {/* Table or Loader */}
      {loading ? (
        <Loader />
      ) : (
        <ProductTable
          products={products}
          total={totalProducts}
          currentPage={currentPage}
          onPageChange={(page) => fetchProducts(page)}
          onUpdate={() => fetchProducts(currentPage)}
        />
      )}
    </DispatchLayout>
  );
};

export default Products;
