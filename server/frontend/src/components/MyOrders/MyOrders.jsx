import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';
import '../../styles/ProductCard.css';

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
      showNotification("Failed to load orders", 'error');
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
          <BackButton to="/customer/home" label="← Back to Customer Home" variant="primary" />
          
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
                onClick={() => navigate('/shop')}
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
            <div className="order-cards-container">
              {orders.map((order, idx) => (
                <div key={idx} className="order-card-horizontal">
                  {/* Product Image */}
                  <div className="order-image-container">
                    <img 
                      src={order.product_image || 'https://via.placeholder.com/140x140/f8f9fa/6c757d?text=No+Image'} 
                      alt={order.product}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="order-details">
                    <h3 className="order-title">{order.product}</h3>
                    <div className="order-info-grid">
                      <div className="order-info-row">
                        <span className="product-info-label">Category:</span>
                        <span className="product-info-value">{order.category || 'General'}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="product-info-label">Unit Price:</span>
                        <span className="product-info-value price">${order.price}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="product-info-label">Quantity:</span>
                        <span className="product-info-value quantity">{order.quantity || 1}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="product-info-label">Total Amount:</span>
                        <span className="product-info-value price">${order.total_amount || order.price}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="product-info-label">Transaction ID:</span>
                        <span className="product-info-value transaction-id">{order.transaction_id}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="product-info-label">Date Purchased:</span>
                        <span className="product-info-value">{order.date_purchased}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="order-actions">
                    <button 
                      onClick={() => navigate(`/customer/reviews/${order.transaction_id}`)}
                      className="order-action-btn secondary"
                    >
                      ⭐ Write Review
                    </button>
                    <button 
                      onClick={() => navigate(`/customer/tickets/${order.transaction_id}`)}
                      className="order-action-btn primary"
                    >
                      🎫 Get Support
                    </button>
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
