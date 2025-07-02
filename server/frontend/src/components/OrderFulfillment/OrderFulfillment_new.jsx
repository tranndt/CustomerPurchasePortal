import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderFulfillment.css';

const OrderFulfillment = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrders, setProcessingOrders] = useState({});

  const pending_orders_url = "http://localhost:8000/djangoapp/api/manager/orders/pending";
  const all_orders_url = "http://localhost:8000/djangoapp/api/manager/orders/all";
  const inventory_url = "http://localhost:8000/djangoapp/api/manager/inventory";
  const process_order_url = "http://localhost:8000/djangoapp/api/manager/orders/process";

  const fetchPendingOrders = async () => {
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
      throw new Error('Failed to fetch pending orders');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(all_orders_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        setAllOrders(data.orders);
      }
    } catch (err) {
      throw new Error('Failed to fetch all orders');
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(inventory_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        setInventory(data.inventory);
      }
    } catch (err) {
      throw new Error('Failed to fetch inventory');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPendingOrders(),
        fetchAllOrders(),
        fetchInventory()
      ]);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        // Refresh data
        await fetchData();
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
            <h2>Loading order fulfillment data...</h2>
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
            <button onClick={() => window.location.reload()}>Retry</button>
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
          <h1 className="order-fulfillment-title">Order Fulfillment & Inventory</h1>
          <p className="order-fulfillment-subtitle">
            Manage pending orders, approve or reject purchases, and monitor inventory levels
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Orders ({pendingOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders ({allOrders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory Overview
            </button>
          </div>

          {/* Pending Orders Tab */}
          {activeTab === 'pending' && (
            <div>
              {pendingOrders.length === 0 ? (
                <div className="no-orders">
                  <h3>No pending orders</h3>
                  <p>All orders have been processed</p>
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
                          <span className="order-detail-value">${order.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">Date:</span>
                          <span className="order-detail-value">{new Date(order.date_purchased).toLocaleDateString()}</span>
                        </div>
                        <div className="order-detail-row">
                          <span className="order-detail-label">Stock Available:</span>
                          <span className="order-detail-value">{order.stock_available} units</span>
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
                        <div style={{ color: '#dc3545', marginTop: '12px', fontSize: '14px', fontWeight: '500' }}>
                          ⚠️ Insufficient stock available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Orders Tab */}
          {activeTab === 'all' && (
            <div>
              <div className="stats-cards">
                <div className="stats-card">
                  <div className="stats-number">{allOrders.length}</div>
                  <div className="stats-label">Total Orders</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{allOrders.filter(o => o.status === 'pending').length}</div>
                  <div className="stats-label">Pending</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{allOrders.filter(o => o.status === 'approved').length}</div>
                  <div className="stats-label">Approved</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{allOrders.filter(o => o.status === 'fulfilled').length}</div>
                  <div className="stats-label">Fulfilled</div>
                </div>
              </div>
              
              <div className="orders-grid">
                {allOrders.map(order => (
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
                        <span className="order-detail-label">Quantity:</span>
                        <span className="order-detail-value">{order.quantity}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="order-detail-label">Total:</span>
                        <span className="order-detail-value">${order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="order-detail-row">
                        <span className="order-detail-label">Date:</span>
                        <span className="order-detail-value">{new Date(order.date_purchased).toLocaleDateString()}</span>
                      </div>
                      {order.processed_by && (
                        <div className="order-detail-row">
                          <span className="order-detail-label">Processed By:</span>
                          <span className="order-detail-value">{order.processed_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div>
              <div className="stats-cards">
                <div className="stats-card">
                  <div className="stats-number">{inventory.length}</div>
                  <div className="stats-label">Total Products</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{inventory.filter(item => item.is_out_of_stock).length}</div>
                  <div className="stats-label">Out of Stock</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{inventory.filter(item => item.is_low_stock && !item.is_out_of_stock).length}</div>
                  <div className="stats-label">Low Stock</div>
                </div>
                <div className="stats-card">
                  <div className="stats-number">{inventory.reduce((total, item) => total + item.pending_orders, 0)}</div>
                  <div className="stats-label">Pending Orders</div>
                </div>
              </div>

              <div className="inventory-grid">
                {inventory.map(item => (
                  <div key={item.id} className="inventory-card">
                    <div className="inventory-name">{item.name}</div>
                    <div className="inventory-details">
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Category:</span>
                        <span className="inventory-detail-value">{item.category}</span>
                      </div>
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Price:</span>
                        <span className="inventory-detail-value">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Current Stock:</span>
                        <span className={`inventory-detail-value ${item.is_out_of_stock ? 'stock-out' : item.is_low_stock ? 'stock-low' : 'stock-good'}`}>
                          {item.current_stock} units
                        </span>
                      </div>
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Pending Orders:</span>
                        <span className="inventory-detail-value">{item.pending_orders} units</span>
                      </div>
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Available After Pending:</span>
                        <span className={`inventory-detail-value ${item.available_after_pending <= 0 ? 'stock-out' : item.available_after_pending <= 5 ? 'stock-low' : 'stock-good'}`}>
                          {item.available_after_pending} units
                        </span>
                      </div>
                    </div>

                    {item.is_out_of_stock && (
                      <div className="stock-indicator stock-out">
                        🚨 Out of Stock
                      </div>
                    )}
                    {item.is_low_stock && !item.is_out_of_stock && (
                      <div className="stock-indicator stock-low">
                        ⚠️ Low Stock
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button 
          className="refresh-button"
          onClick={fetchData}
          title="Refresh Data"
        >
          ↻
        </button>
      </div>
    </div>
  );
};

export default OrderFulfillment;
