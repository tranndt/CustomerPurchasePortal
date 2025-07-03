import React, { useState, useEffect, useCallback } from 'react';
import SimpleNav from '../SimpleNav/SimpleNav';
import BackButton from '../BackButton/BackButton';
import { useAlert } from '../AlertContext/AlertContext';
import './OrderFulfillment.css';

const OrderFulfillment = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrders, setProcessingOrders] = useState({});
  const { showAlert, showPrompt } = useAlert();

  const pending_orders_url = "http://localhost:8000/djangoapp/api/manager/orders/pending";
  const all_orders_url = "http://localhost:8000/djangoapp/api/manager/orders/all";
  const process_order_url = "http://localhost:8000/djangoapp/api/manager/orders/process";

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        fetch(pending_orders_url, { credentials: 'include' }),
        fetch(all_orders_url, { credentials: 'include' })
      ]);

      const pendingData = await pendingResponse.json();
      const allData = await allResponse.json();

      if (pendingData.status === 403 || allData.status === 403) {
        setError('Access denied. Manager/Admin privileges required.');
        return;
      }

      if (pendingData.status !== 200 || allData.status !== 200) {
        throw new Error('Failed to fetch orders');
      }

      // Combine and deduplicate orders (pending orders might be subset of all orders)
      const pendingOrders = pendingData.orders || [];
      const allOrdersData = allData.orders || [];
      
      // Merge orders, prioritizing pending data for pending orders
      const mergedOrders = [...allOrdersData];
      pendingOrders.forEach(pendingOrder => {
        const existingIndex = mergedOrders.findIndex(order => order.id === pendingOrder.id);
        if (existingIndex >= 0) {
          mergedOrders[existingIndex] = pendingOrder; // Use pending data (more detailed)
        } else {
          mergedOrders.push(pendingOrder);
        }
      });

      setAllOrders(mergedOrders);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [pending_orders_url, all_orders_url]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter orders by status
  const pendingOrders = allOrders.filter(order => order.status === 'pending');
  const awaitingDeliveryOrders = allOrders.filter(order => order.status === 'approved');
  const cancelledOrders = allOrders.filter(order => order.status === 'rejected' || order.status === 'cancelled');
  const fulfilledOrders = allOrders.filter(order => order.status === 'fulfilled');

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
        // Refresh all data
        await fetchAllData();
        await showAlert(data.message, 'Success', 'success');
      } else {
        await showAlert(data.message || `Failed to ${action} order`, 'Error', 'error');
      }
    } catch (err) {
      await showAlert(`Error ${action}ing order: ` + err.message, 'Error', 'error');
    } finally {
      setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleApprove = async (orderId) => {
    const notes = await showPrompt('Add any notes for this approval:', 'Enter notes (optional)', 'Approve Order', false, 'info');
    if (notes !== null) { // User didn't cancel
      processOrder(orderId, 'approve', notes);
    }
  };

  const handleReject = async (orderId) => {
    const notes = await showPrompt('Please provide a reason for rejection:', 'Enter reason', 'Reject Order', false, 'warning');
    if (notes !== null && notes.trim() !== '') {
      processOrder(orderId, 'reject', notes);
    } else if (notes !== null) {
      await showAlert('Please provide a reason for rejection', 'Rejection Incomplete', 'warning');
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
            <button onClick={fetchAllData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const renderOrderCards = (orders, showActions = false) => {
    if (orders.length === 0) {
      return (
        <div className="no-orders">
          <h3>No orders in this category</h3>
          <p>Orders will appear here when they match this status.</p>
        </div>
      );
    }

    return (
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            {/* Product Image */}
            <div className="order-image">
              {order.product_image ? (
                <img src={order.product_image} alt={order.product_name} />
              ) : (
                <span>📦</span>
              )}
            </div>
            
            <div className="order-content">
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="order-details compact">
                <div className="order-detail-row">
                  <span className="order-detail-label">Product:</span>
                  <span className="order-detail-value">{order.product_name}</span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Customer:</span>
                  <span className="order-detail-value">{order.customer_name}</span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Quantity:</span>
                  <span className="order-detail-value">{order.quantity} × ${order.unit_price.toFixed(2)}</span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Total:</span>
                  <span className="order-detail-value total-amount">${order.total_amount.toFixed(2)}</span>
                </div>
                {order.notes && (
                  <div className="order-detail-row">
                    <span className="order-detail-label">Notes:</span>
                    <span className="order-detail-value">{order.notes}</span>
                  </div>
                )}
              </div>

              {showActions && order.stock_available !== undefined && order.stock_available < order.quantity && (
                <div className="stock-warning">
                  ⚠️ Insufficient stock available. Cannot approve until restocked.
                </div>
              )}
            </div>
            
            {showActions && (
              <div className="order-actions">
                <button
                  className="action-button approve-button"
                  onClick={() => handleApprove(order.id)}
                  disabled={processingOrders[order.id] || (order.stock_available !== undefined && order.stock_available < order.quantity)}
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
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <SimpleNav />
      <div className="order-fulfillment">
        <div className="order-fulfillment-container">
        <BackButton to="/admin/home" label="← Back to Admin Home" variant="primary" />
        
        {/* Header */}
        <div className="order-fulfillment-header">
          <h1 className="order-fulfillment-title">Order Fulfillment & Management</h1>
          <p className="order-fulfillment-subtitle">
            Comprehensive order management system for all order statuses
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-number">{pendingOrders.length}</div>
            <div className="stats-label">Pending</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{awaitingDeliveryOrders.length}</div>
            <div className="stats-label">Awaiting Delivery</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{cancelledOrders.length}</div>
            <div className="stats-label">Cancelled</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{fulfilledOrders.length}</div>
            <div className="stats-label">Fulfilled</div>
          </div>
          <div className="stats-card">
            <div className="stats-number">{allOrders.length}</div>
            <div className="stats-label">Total Orders</div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'awaiting' ? 'active' : ''}`}
              onClick={() => setActiveTab('awaiting')}
            >
              Awaiting Delivery ({awaitingDeliveryOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({cancelledOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'fulfilled' ? 'active' : ''}`}
              onClick={() => setActiveTab('fulfilled')}
            >
              Fulfilled ({fulfilledOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Order History ({allOrders.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'pending' && renderOrderCards(pendingOrders, true)}
            {activeTab === 'awaiting' && renderOrderCards(awaitingDeliveryOrders, false)}
            {activeTab === 'cancelled' && renderOrderCards(cancelledOrders, false)}
            {activeTab === 'fulfilled' && renderOrderCards(fulfilledOrders, false)}
            {activeTab === 'history' && renderOrderCards(allOrders, false)}
          </div>
        </div>

        {/* Refresh Button */}
        <button 
          className="refresh-button"
          onClick={fetchAllData}
          title="Refresh All Orders"
        >
          ↻
        </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillment;
