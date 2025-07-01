import React, { useEffect, useState } from "react";
import SimpleNav from "../SimpleNav/SimpleNav";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    const res = await fetch("http://localhost:8000/djangoapp/api/allorders", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (data.status === 200) {
      setOrders(data.orders);
    } else {
      alert("Access denied or failed to load orders.");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2>📊 All Customer Orders (Admin)</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px", paddingBottom: "10px" }}>
            <p><strong>Customer:</strong> {order.customer}</p>
            <p><strong>Product:</strong> {order.product}</p>
            <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
            <p><strong>Date:</strong> {order.date}</p>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default AllOrders;
