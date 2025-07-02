import React, { useState, useEffect, useCallback } from 'react';
import './OrderFulfillment.css';

const OrderFulfillment = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrders, setProcessingOrders] = useState({});

  const pending_orders_url = "http://localhost:8000/djangoapp/api/manager/orders/pending";
  const process_order_url = "http://localhost:8000/djangoapp/api/manager/orders/process";

  const fetchPendingOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(pending_orders_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        setPendingOrders(data.orders);
      } else if (data.status === 403) {
        setError('Access denied. Manager/Admin privileges required.');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to load pending orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [pending_orders_url]);

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const processOrder = async (orderId, action, notes = '') => {
    setProcessingOrders(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch(process_order_url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          action: action,
          notes: notes
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        alert(data.message);
        // Refresh pending orders
        await fetchPendingOrders();
      } else {
        alert(data.message || `Failed to ${action} order`);
      }
    } catch (err) {
      alert(`Error ${action}ing order: ` + err.message);
    } finally {
      setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleApprove = (orderId) => {
    const notes = prompt('Add any notes for this approval (optional):');
    if (notes !== null) { // User didn't cancel
      processOrder(orderId, 'approve', notes);
    }
  };

  const handleReject = (orderId) => {
    const notes = prompt('Please provide a reason for rejection:');
    if (notes !== null && notes.trim() !== '') {
      processOrder(orderId, 'reject', notes);
    } else if (notes !== null) {
      alert('Please provide a reason for rejection');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`order-status status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="order-fulfillment">
        <div className="order-fulfillment-container">
          <div className="loading">
            <h2>Loading pending orders...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-fulfillment">
        <div className="order-fulfillment-container">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchPendingOrders}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-fulfillment">
      <div className="order-fulfillment-container">
        {/* Header */}
        <div className="order-fulfillment-header">
          <h1 className="order-fulfillment-title">Order Fulfillment</h1>
          <p className="order-fulfillment-subtitle">
            Review and approve or reject pending customer orders
          </p>
        </div>

        {/* Statistics Card */}
        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-number">{pendingOrders.length}</div>
            <div className="stats-label">Pending Orders</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              {pendingOrders.filter(order => order.stock_available >= order.quantity).length}
            </div>
            <div className="stats-label">Ready to Approve</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              {pendingOrders.filter(order => order.stock_available < order.quantity).length}
            </div>
            <div className="stats-label">Insufficient Stock</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">
              ${pendingOrders.reduce((total, order) => total + order.total_amount, 0).toFixed(2)}
            </div>
            <div className="stats-label">Total Value</div>
          </div>
        </div>

        {/* Pending Orders */}
        {pendingOrders.length === 0 ? (
          <div className="no-orders">
            <h3>No pending orders</h3>
            <p>All orders have been processed. New orders will appear here for approval.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {pendingOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order.id}</div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="order-details">
                  <div className="order-detail-row">
                    <span className="order-detail-label">Product:</span>
                    <span className="order-detail-value">{order.product_name}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Customer:</span>
                    <span className="order-detail-value">{order.customer_name}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Username:</span>
                    <span className="order-detail-value">@{order.customer_username}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Category:</span>
                    <span className="order-detail-value">{order.product_category}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Quantity:</span>
                    <span className="order-detail-value">{order.quantity}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Unit Price:</span>
                    <span className="order-detail-value">${order.unit_price.toFixed(2)}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Total:</span>
                    <span className="order-detail-value total-amount">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Date:</span>
                    <span className="order-detail-value">{new Date(order.date_purchased).toLocaleDateString()}</span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Stock Available:</span>
                    <span className={`order-detail-value ${order.stock_available >= order.quantity ? 'stock-sufficient' : 'stock-insufficient'}`}>
                      {order.stock_available} units
                    </span>
                  </div>
                  <div className="order-detail-row">
                    <span className="order-detail-label">Transaction ID:</span>
                    <span className="order-detail-value transaction-id">{order.transaction_id}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="action-button approve-button"
                    onClick={() => handleApprove(order.id)}
                    disabled={processingOrders[order.id] || order.stock_available < order.quantity}
                  >
                    {processingOrders[order.id] ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className="action-button reject-button"
                    onClick={() => handleReject(order.id)}
                    disabled={processingOrders[order.id]}
                  >
                    {processingOrders[order.id] ? 'Processing...' : 'Reject'}
                  </button>
                </div>

                {order.stock_available < order.quantity && (
                  <div className="stock-warning">
                    ⚠️ Insufficient stock available. Cannot approve until restocked.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <button 
          className="refresh-button"
          onClick={fetchPendingOrders}
          title="Refresh Pending Orders"
        >
          ↻
        </button>
      </div>
    </div>
  );
};

export default OrderFulfillment;
