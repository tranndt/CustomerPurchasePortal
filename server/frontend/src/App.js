import LoginPanel from "./components/Login/Login"
import Register from "./components/Register/Register"
import { Routes, Route } from "react-router-dom";
import Home from './components/Home/Home';
import MyOrders from './components/MyOrders/MyOrders';
import ProductReview from './components/ProductReview/ProductReview';
import SupportClaim from './components/SupportClaim/SupportClaim';
import AllOrders from './components/AllOrders/AllOrders';
import TicketManager from './components/TicketManager/TicketManager';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPanel />} />
      <Route path="/register" element={<Register />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/review/:product_id" element={<ProductReview />} />
      <Route path="/support/:order_id" element={<SupportClaim />} />
      <Route path="/admin/orders" element={<AllOrders />} />
      <Route path="/admin/tickets" element={<TicketManager />} />
    </Routes>
  );
}
export default App;
