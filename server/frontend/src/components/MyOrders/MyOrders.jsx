import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';
import '../../styles/global.css';
import './MyOrders.css';

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
      <div className="page-container">
        <div className="page-content">
          <BackButton to="/customer/home" label="← Back to Customer Home" variant="primary" />
          
          <div className="page-header">
            <h1 className="page-title gradient-text">
              📦 My Orders
            </h1>
            <p className="page-subtitle">
              View your purchase history and manage your orders
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No orders found</h3>
              <p className="empty-description">Your order history will appear here once you make a purchase.</p>
              <button 
                onClick={() => navigate('/shop')}
                className="btn btn-gradient-primary"
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
                      onClick={() => navigate('/customer/reviews')}
                      className="order-action-btn secondary"
                    >
                      ⭐ Leave Feedback
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
