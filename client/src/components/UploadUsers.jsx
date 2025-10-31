import React, { useRef, useState } from "react";
import { Button, message, Spin } from "antd";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import dayjs from "dayjs";
import API from "../utils/api";

const UploadUsers = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "xlsx" || fileType === "xls") {
      handleExcelFile(file);
    } else if (fileType === "csv") {
      handleCsvFile(file);
    } else {
      message.error("Please upload a valid Excel or CSV file.");
    }
  };

  const handleExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploading(true);
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const formattedData = jsonData.map((row) => {
        if (row.date) {
          const parsedDate = dayjs(row.date);
          if (parsedDate.isValid()) {
            row.date = parsedDate.format("YYYY-MM-DD");
          }
        }
        return row;
      });

      try {
        const response = await API.post(`/admin/bulk-upload`, formattedData, {
          responseType: "blob",
        });

        const contentType = response.headers["content-type"];

        if (
          contentType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          message.warning("Some users were skipped. Downloading report...");
          downloadBlob(response.data, "skipped_users.xlsx");
        } else {
          const text = await response.data.text();
          const json = JSON.parse(text);
          const { message: successMessage, created, updated } = json;
          message.success(
            successMessage ||
              `Upload complete. Created: ${created}, Updated: ${updated}`
          );
        }
      } catch (error) {
        console.error("Upload failed:", error);
        message.error(error?.response?.data?.message || error.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploading(true);
      const csvData = event.target.result;

      Papa.parse(csvData, {
        complete: async (result) => {
          const jsonData = result.data;

          const formattedData = jsonData.map((row) => {
            if (row.date) {
              const parsedDate = dayjs(row.date, ["DD-MM-YYYY", "YYYY-MM-DD"]);
              if (parsedDate.isValid()) {
                row.date = parsedDate.format("YYYY-MM-DD");
              }
            }
            return row;
          });

          try {
            const response = await API.post(
              `/admin/bulk-upload`,
              formattedData,
              {
                responseType: "blob",
              }
            );

            const contentType = response.headers["content-type"];

            if (
              contentType ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ) {
              message.warning("Some users were skipped. Downloading report...");
              downloadBlob(response.data, "skipped_users.xlsx");
            } else {
              const text = await response.data.text();
              const json = JSON.parse(text);
              const { message: successMessage, created, updated } = json;
              message.success(
                successMessage ||
                  `Upload complete. Created: ${created}, Updated: ${updated}`
              );
            }
          } catch (error) {
            console.error("Upload failed:", error);
            message.error("Failed to upload CSV data.");
          } finally {
            setUploading(false);
          }
        },
        header: true,
      });
    };
    reader.readAsText(file);
  };

  return (
    <Spin
      spinning={uploading}
      tip="Please wait while processing bulk upload..."
    >
      <div>
        <Button type="primary" onClick={handleButtonClick} disabled={uploading}>
          Upload Excel/CSV
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </Spin>
  );
};

export default UploadUsers;
