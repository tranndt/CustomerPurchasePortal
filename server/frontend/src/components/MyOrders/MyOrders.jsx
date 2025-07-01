import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const response = await fetch("http://localhost:8000/djangoapp/api/customer/orders", {
      method: "GET",
      credentials: "include"
    });
    const data = await response.json();
    if (data.status === 200) {
      setOrders(data.orders);
    } else {
      alert("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2>📦 My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h3>{order.product}</h3>
            <p>Category: {order.category}</p>
            <p>Price: ${order.price}</p>
            <p>Transaction ID: {order.transaction_id}</p>
            <p>Date Purchased: {order.date_purchased}</p>
            <button onClick={() => navigate(`/customer/reviews/${order.transaction_id}`)} style={{ marginRight: "10px" }}>
              Leave Review
            </button>
            <button onClick={() => navigate(`/customer/tickets/${order.transaction_id}`)}>
              Get Support
            </button>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default MyOrders;
