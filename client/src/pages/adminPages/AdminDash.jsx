import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import NewOrders from "../../components/AdminStatus/NewOrders";
import ReadyToShip from "../../components/AdminStatus/ReadyToShip";
import HoldMoneyIssue from "../../components/AdminStatus/HoldMoneyIssue";
import PNA from "../../components/AdminStatus/PNA";
import InProgress from "../../components/AdminStatus/InProgress";
import Shipped from "../../components/AdminStatus/Shipped";
import OrderCount from "../../components/AdminStatus/OrderCount";
import Revenu from "../../components/AdminStatus/Revenu";
import Archived from "../../components/AdminStatus/Archieved";
import EasyshipNew from "../../components/AdminStatus/EasyshipNew";
import EasyshipRTD from "../../components/AdminStatus/EasyshipRTD";
import EasyshipHMI from "../../components/AdminStatus/EasyshipHMI";
import EasyshipPNA from "../../components/AdminStatus/EasyshipPNA";
import EasyshipShipped from "../../components/AdminStatus/EasyshipShipped";
import EasyShipArchive from "../../components/AdminStatus/EasyShipArchive";
import EasyshipRevenu from "../../components/AdminStatus/EasyshipRevenu";

const AdminDash = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text inline-block max-w-full whitespace-normal">
          Actions Needing Your Attention Today for Orders
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <EasyshipNew />
          <EasyshipRTD />
          <EasyshipHMI />
          <EasyshipPNA />
          <EasyshipShipped />
          <EasyShipArchive />
        </div>
        <h2 className="text-2xl mt-16 font-bold mb-6 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text inline-block max-w-full whitespace-normal">
          Summary of Orders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
        <EasyshipRevenu />
      </div>
      {/* <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text inline-block max-w-full whitespace-normal">
          Actions Needing Your Attention Today
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <NewOrders />
          <ReadyToShip />
          <HoldMoneyIssue />
          <InProgress />
          <PNA />
          <Shipped />
          <Archived />
        </div>
        <h2 className="text-2xl mt-16 font-bold mb-6 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text inline-block max-w-full whitespace-normal">
          Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <OrderCount />
        </div>
        <Revenu />
      </div> */}
    </AdminLayout>
  );
};

export default AdminDash;
