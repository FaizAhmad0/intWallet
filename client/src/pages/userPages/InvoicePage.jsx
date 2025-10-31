import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../../utils/api";
import { toWords } from "number-to-words";
import html2pdf from "html2pdf.js";

const InvoicePage = () => {
  const location = useLocation();
  const { order } = location.state || {};
  console.log(order);
  const [user, setUser] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user/user-details");
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  if (!order) return <p className="text-black">No invoice data.</p>;

  const items = Array.isArray(order.items) ? order.items : [];

  let subtotal = 0,
    gstTotal = 0,
    shippingTotal = 0,
    finalGSTRate = 0,
    shippingGSTTotal = 0;

  const calculatedItems = items.map((item) => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    const gstRate = item.gstRate || 0;
    finalGSTRate = gstRate;
    const shipping = item.shipping || 0;

    const itemSubtotal = price * quantity;
    const itemGST = (itemSubtotal * gstRate) / 100;
    const itemShipping = shipping * quantity;
    const itemShippingGST = (itemShipping * gstRate) / 100;

    subtotal += itemSubtotal;
    gstTotal += itemGST;
    shippingTotal += itemShipping;
    shippingGSTTotal += itemShippingGST;

    return {
      ...item,
      quantity,
      itemSubtotal,
      itemGST,
      itemShipping,
      itemShippingGST,
      total: itemSubtotal + itemGST + itemShipping + itemShippingGST,
    };
  });

  const grandTotal = subtotal + gstTotal + shippingTotal + shippingGSTTotal;
  const totalInWords =
    toWords(Math.round(grandTotal)).toUpperCase() + " RUPEES ONLY";

  return (
    <div className="p-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => {
            const element = printRef.current;
            const opt = {
              margin: 0.5,
              filename: `${order.invoice || "invoice"}.pdf`,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            };
            html2pdf().set(opt).from(element).save();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download Invoice
        </button>
      </div>

      <div
        className="max-w-4xl mx-auto bg-white p-8 shadow border text-[13px] font-sans text-black print:shadow-none print:border-none"
        ref={printRef}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <img src="/logo.png" alt="Company Logo" className="w-36 h-auto" />
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase">Tax Invoice</h2>
            <p>
              Invoice No: <strong>SC{order.invoice || "N/A"}</strong>
            </p>
            <p>
              Date:{" "}
              {new Date(order.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Bill To & Payment */}
        <div className="grid grid-cols-2 gap-4 mb-4 border-b pb-4">
          <div>
            <h3 className="font-bold">Bill To:</h3>
            <p>
              <strong>Name:</strong> {user?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {user?.primaryContact || "N/A"}
            </p>
            <p>
              <strong>Add:</strong> {user?.address || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {user?.state || "N/A"}
            </p>
            <p>
              <strong>Pin:</strong> {user?.pincode || "N/A"}
            </p>
            <p>
              <strong>GST:</strong> {user?.gst || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="font-bold">Payment Mode: Instamojo wallet</h3>
            <p>
              <strong>Transaction ID:</strong> {order._id}
            </p>
            <p>
              <strong>Transaction Date:</strong>{" "}
              <span>
                Date:{" "}
                {new Date(order.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </p>
            <p>
              <strong>Amount:</strong> ₹{order.finalAmount}
            </p>
          </div>
        </div>

        {/* Product Table */}
        <table className="w-full border mt-4 text-center text-sm">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="border p-2">S.No.</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">SKU</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {calculatedItems.map((item, index) => (
              <tr key={index}>
                <td className="border p-1">{index + 1}</td>
                <td className="border p-1">{item.name}</td>
                <td className="border p-1">{item.sku}</td>
                <td className="border p-1">{item.quantity}</td>
                <td className="border p-1">₹{item.price.toFixed(2)}</td>
                <td className="border p-1">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 text-sm flex justify-end">
          <table className="text-left border w-96">
            <tbody>
              <tr>
                <td className="border p-1">Total Amount:</td>
                <td className="border p-1">₹{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border p-1">Shipping:</td>
                <td className="border p-1">₹{shippingTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border p-1">Tax Amount ({finalGSTRate}%):</td>
                <td className="border p-1">
                  ₹{(gstTotal + shippingGSTTotal).toFixed(2)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border p-1">
                  Payable Amount including GST ({finalGSTRate}%):
                </td>
                <td className="border p-1">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <p className="mt-2 font-bold text-left">{totalInWords}</p>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs border-t pt-2">
          <div>
            <h4 className="font-semibold">Terms & Conditions</h4>
            <ul className="list-disc pl-4 mt-1">
              <li>Online download only. No physical delivery.</li>
              <li>Goods once sold will not be taken back or exchanged.</li>
              <li>
                Seller is not responsible for any loss or damage of goods in
                transit.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company Details</h4>
            <p>Company PAN: CANPJ8390R</p>
            <p>Company GSTIN/UIN: 08CANPJ3390R1ZT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
