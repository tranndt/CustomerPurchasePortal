import "./App.css";
import "./styles/global.css";
import LoginPanel from "./components/Login/Login"
import Register from "./components/Register/Register"
import { Routes, Route } from "react-router-dom";
import MyOrders from './components/MyOrders/MyOrders';
import ProductReview from './components/ProductReview/ProductReview';
import SupportClaim from './components/SupportClaim/SupportClaim';
import TicketManager from './components/TicketManager/TicketManager';
import TicketDetail from './components/TicketDetail/TicketDetail';
import Landing from './components/Landing/Landing';
import CustomerHome from './components/CustomerHome/CustomerHome';
import AdminHome from './components/AdminHome/AdminHome';
import SupportHome from './components/SupportHome/SupportHome';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import MyReviews from './components/MyReviews/MyReviews';
import MyTickets from './components/MyTickets/MyTickets';
import AllReviews from './components/AllReviews/AllReviews';
import Shop from './components/Shop/Shop';
import Cart from './components/Cart/Cart';
import OrderFulfillment from './components/OrderFulfillment/OrderFulfillment';
import InventoryManagement from './components/InventoryManagement/InventoryManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/support/home" element={<SupportHome />} />
      <Route path="/login" element={<LoginPanel />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/home" element={<CustomerHome />} />
      <Route path="/customer/reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
      <Route path="/customer/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      <Route path="/customer/reviews/:transaction_id" element={<ProtectedRoute><ProductReview /></ProtectedRoute>} />
      <Route path="/customer/tickets/:transaction_id" element={<ProtectedRoute><SupportClaim /></ProtectedRoute>} />
      <Route path="/admin/fulfillment" element={<ProtectedRoute><OrderFulfillment /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
      <Route path="/admin/tickets" element={<ProtectedRoute><TicketManager /></ProtectedRoute>} />
      <Route path="/admin/tickets/:ticket_id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute><AllReviews /></ProtectedRoute>} />
      <Route path="/support/tickets" element={<ProtectedRoute><TicketManager /></ProtectedRoute>} />
      <Route path="/support/tickets/:ticket_id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

    </Routes>
  );
}
export default App;
