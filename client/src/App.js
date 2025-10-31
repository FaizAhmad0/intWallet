import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginForm from "./pages/LoginForm";
import AdminDash from "./pages/adminPages/AdminDash";
import AdminPrivateRoute from "./components/AdminPrivateRoute";
import AllClients from "./pages/adminPages/AllClients";
import AllManagers from "./pages/adminPages/AllManagers";
import WalletAction from "./pages/adminPages/WalletAction";
import AllTransactions from "./pages/adminPages/AllTransactions";
import ManagerPrivateRoute from "./components/ManagerPrivateRoute";
import ManagerDash from "./pages/managerPages/ManagerDash";
import ManagerClients from "./pages/managerPages/ManagerClients";
import UserPrivateRoute from "./components/UserPrivateRoute";
import UserDash from "./pages/userPages/UserDash";
import Wallet from "./pages/userPages/Wallet";
import PaymentStatus from "./pages/userPages/PaymentStatus";
import AllOrders from "./pages/adminPages/AllOrders";
import DispatchDash from "./pages/dispatchPages/DispatchDash";
import DispatchPrivateRoute from "./components/DispatchPrivateRoute";
import Products from "./pages/dispatchPages/Products";
import ManagerOrders from "./pages/managerPages/ManagerOrders";
import Tier from "./pages/userPages/Tier";
import AccountantPrivateRoute from "./components/AccountantPrivateRoute";
import Accountant from "./pages/Accountant";
import InvoicePage from "./pages/userPages/InvoicePage";
import EasyShipOrders from "./pages/dispatchPages/EasyShipOrders";
import QuickDeliveryOrders from "./pages/userPages/QuickDeliveryOrders";
import EasyAccountant from "./pages/EasyAccountant";
import DetailsReporting from "./pages/dispatchPages/DetailsReporting";
import AccountAllTransaction from "./pages/AccountAllTransaction";
import AccountantWalletAction from "./pages/AccountantWalletAction";
import AdminEasyShipOrders from "./pages/adminPages/AdminEasyShipOrders";
import AccountantUsers from "./pages/AccountantUsers";
import DispatchClients from "./pages/dispatchPages/DispatchClients";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<LoginForm />} />

          <Route element={<AdminPrivateRoute />}>
            <Route path="/admin-dash" exact element={<AdminDash />} />
            <Route path="/view-clients" exact element={<AllClients />} />
            <Route path="/view-managers" exact element={<AllManagers />} />
            <Route path="/wallet-action" exact element={<WalletAction />} />
            <Route path="/view-all-orders" exact element={<AllOrders />} />
            <Route
              path="/view-easyship-orders"
              exact
              element={<AdminEasyShipOrders />}
            />
            <Route
              path="/all-transactions"
              exact
              element={<AllTransactions />}
            />
          </Route>
          <Route element={<ManagerPrivateRoute />}>
            <Route path="/manager-dash" exact element={<ManagerDash />} />
            <Route path="/clients" exact element={<ManagerClients />} />
            <Route path="/order-history" exact element={<ManagerOrders />} />
          </Route>
          <Route element={<UserPrivateRoute />}>
            <Route path="/user-order" exact element={<UserDash />} />
            <Route
              path="/quick-delivery-orders"
              exact
              element={<QuickDeliveryOrders />}
            />
            <Route path="/wallet" exact element={<Wallet />} />
            <Route path="/payment-status" exact element={<PaymentStatus />} />
            <Route path="/tiar" exact element={<Tier />} />
            <Route path="/invoice" exact element={<InvoicePage />} />
          </Route>
          <Route element={<DispatchPrivateRoute />}>
            <Route path="/dispatch-dash" exact element={<DispatchDash />} />
            <Route path="/products" exact element={<Products />} />
            <Route path="/easyship-order" exact element={<EasyShipOrders />} />
            <Route path="/detail-report" exact element={<DetailsReporting />} />
            <Route
              path="/dispatch-all-client"
              exact
              element={<DispatchClients />}
            />
          </Route>
          <Route element={<AccountantPrivateRoute />}>
            <Route path="/accountant-dash" exact element={<Accountant />} />
            <Route
              path="/account-all-transactions"
              exact
              element={<AccountAllTransaction />}
            />
            <Route
              path="/easy-ship-orders"
              exact
              element={<EasyAccountant />}
            />
            <Route
              path="/accountant-wallet-action"
              exact
              element={<AccountantWalletAction />}
            />
            <Route
              path="/accountant-users"
              exact
              element={<AccountantUsers />}
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
