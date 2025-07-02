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
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
            border: "1px solid #e9ecef"
          }}>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#2c3e50", 
              margin: "0 0 12px 0",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              📦 My Orders
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              View your purchase history and manage your orders
            </p>
          </div>

          {orders.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
              <h3 style={{ color: "#6c757d", marginBottom: "12px", fontSize: "24px" }}>No orders found</h3>
              <p style={{ color: "#adb5bd", margin: "0 0 24px 0", fontSize: "16px" }}>Your order history will appear here once you make a purchase.</p>
              <button 
                onClick={() => navigate('/products')}
                style={{
                  background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 2px 4px rgba(0, 123, 255, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                🛍️ Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map((order, idx) => (
                <div key={idx} style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
                  border: "1px solid #e9ecef",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "start" }}>
                    <div>
                      <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "20px" }}>{order.product}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Category:</span>
                          <span style={{ marginLeft: "8px", color: "#6c757d" }}>{order.category || 'General'}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Unit Price:</span>
                          <span style={{ marginLeft: "8px", color: "#28a745", fontWeight: "600" }}>${order.price}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Quantity:</span>
                          <span style={{ marginLeft: "8px", color: "#6c757d", fontWeight: "600" }}>{order.quantity || 1}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Total Amount:</span>
                          <span style={{ marginLeft: "8px", color: "#28a745", fontWeight: "700", fontSize: "16px" }}>${order.total_amount || order.price}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Transaction ID:</span>
                          <span style={{ marginLeft: "8px", color: "#6c757d", fontFamily: "monospace" }}>{order.transaction_id}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "600", color: "#495057" }}>Date Purchased:</span>
                          <span style={{ marginLeft: "8px", color: "#6c757d" }}>{order.date_purchased}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "140px" }}>
                      <button 
                        onClick={() => navigate(`/customer/reviews/${order.transaction_id}`)}
                        style={{
                          background: "linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          boxShadow: "0 2px 4px rgba(255, 193, 7, 0.3)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                        onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                      >
                        Leave Review
                      </button>
                      <button 
                        onClick={() => navigate(`/customer/tickets/${order.transaction_id}`)}
                        style={{
                          background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                        onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                      >
                        Get Support
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
