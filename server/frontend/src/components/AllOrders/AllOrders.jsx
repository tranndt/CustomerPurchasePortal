import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/djangoapp/api/admin/orders", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.status === 200) {
        setOrders(data.orders);
      } else {
        showNotification("Access denied or failed to load orders.", 'error');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!username) {
      navigate('/');
      return;
    }
    
    if (userRole && userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'manager') {
      navigate('/customer/home');
      return;
    }

    fetchAllOrders();
  }, [navigate]);

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
          <BackButton to="/admin/home" label="← Back to Admin Home" variant="primary" />
          
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
              📊 All Customer Orders
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Monitor and manage all customer orders across the system
            </p>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px"
              }}></div>
              <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📊</div>
              <h3 style={{ color: "#6c757d", marginBottom: "12px", fontSize: "24px" }}>No orders found</h3>
              <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>Customer orders will appear here once placed.</p>
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
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr", gap: "20px", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "600", color: "#495057", fontSize: "14px", display: "block", marginBottom: "4px" }}>Customer</span>
                      <span style={{ color: "#2c3e50", fontSize: "16px" }}>{order.customer}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "600", color: "#495057", fontSize: "14px", display: "block", marginBottom: "4px" }}>Product</span>
                      <span style={{ color: "#2c3e50", fontSize: "16px" }}>{order.product}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: "600", color: "#495057", fontSize: "14px", display: "block", marginBottom: "4px" }}>Transaction ID</span>
                      <span style={{ color: "#6c757d", fontSize: "14px", fontFamily: "monospace" }}>{order.transaction_id}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#6c757d",
                        backgroundColor: "#f8f9fa",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid #e9ecef"
                      }}>
                        {new Date(order.date).toLocaleDateString()}
                      </span>
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

export default AllOrders;
