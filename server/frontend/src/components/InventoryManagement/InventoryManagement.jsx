import React, { useState, useEffect, useCallback } from 'react';
import SimpleNav from '../SimpleNav/SimpleNav';
import BackButton from '../BackButton/BackButton';
import { useAlert } from '../AlertContext/AlertContext';
import API_URLS from '../../services/apiConfig';
import './InventoryManagement.css';
import '../../styles/global.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('allProducts');
  const [requestedItems, setRequestedItems] = useState([]);
  const [requestQuantities, setRequestQuantities] = useState({});
  const { showAlert } = useAlert();

  const inventory_url = `${API_URLS.BASE_URL}/djangoapp/api/manager/inventory`;

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(inventory_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        setInventory(data.inventory);
      } else if (data.status === 403) {
        setError('Access denied. Manager/Admin privileges required.');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to load inventory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [inventory_url]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Helper function for checking if an item is requested
  const isItemRequested = (itemId) => {
    return requestedItems.some(item => item.id === itemId);
  };
  
  // Filter inventory based on search term, category, and active tab
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    // Filter by tab
    if (activeTab === 'stockRequested') {
      return matchesSearch && matchesCategory && isItemRequested(item.id);
    }
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(inventory.map(item => item.category))];
  
  // Helper functions for stock requests
  const handleQuantityChange = (itemId, change) => {
    setRequestQuantities(prev => {
      const currentValue = prev[itemId] || 1;
      const newValue = Math.max(1, currentValue + change);
      return { ...prev, [itemId]: newValue };
    });
  };
  
  const handleRequestStock = (item) => {
    const quantity = requestQuantities[item.id] || 1;
    
    // Add to requested items
    setRequestedItems(prev => {
      const existingItem = prev.find(ri => ri.id === item.id);
      if (existingItem) {
        return prev.map(ri => ri.id === item.id ? { ...ri, quantity: quantity } : ri);
      } else {
        return [...prev, { ...item, quantity, requested_at: new Date() }];
      }
    });
    
    // Reset quantity input
    setRequestQuantities(prev => ({ ...prev, [item.id]: 1 }));
    
    // Show confirmation
    showAlert(`Requested ${quantity} units of ${item.name} for restocking`, 'Stock Request Submitted', 'success');
  };

  if (loading) {
    return (
      <div className="inventory-management">
        <div className="inventory-container">
          <div className="loading">
            <h2>Loading inventory data...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-management">
        <div className="inventory-container">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchInventory}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="inventory-management">
        <div className="inventory-container">
        <BackButton to="/admin/home" label="← Back to Admin Home" variant="primary" />
        
        {/* Header */}
        <div className="inventory-header">
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">
            Monitor stock levels, track pending orders, and manage product inventory
          </p>
        </div>

        {/* Statistics Cards */}
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
          <div className="stats-card">
            <div className="stats-number">{requestedItems.length}</div>
            <div className="stats-label">Stock Requests</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="inventory-tabs">
          <button 
            className={`inventory-tab ${activeTab === 'allProducts' ? 'active' : ''}`}
            onClick={() => setActiveTab('allProducts')}
          >
            All Products ({inventory.length})
          </button>
          <button 
            className={`inventory-tab ${activeTab === 'stockRequested' ? 'active' : ''}`}
            onClick={() => setActiveTab('stockRequested')}
          >
            Stock Requested ({requestedItems.length})
          </button>
        </div>

        {/* Filters */}
        <div className="inventory-filters">
          <div className="filter-group">
            <label htmlFor="search">Search Products:</label>
            <input
              type="text"
              id="search"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="category">Filter by Category:</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="inventory-grid">
          {filteredInventory.length === 0 ? (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredInventory.map(item => (
              <div key={item.id} className="inventory-card">
                {/* Product Image */}
                <div className="inventory-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                
                {/* Product Content */}
                <div className="inventory-content">
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
                      <span className={`inventory-detail-value ${item.is_out_of_stock ? 'stock-critical' : item.is_low_stock ? 'stock-warning' : 'stock-good'}`}>
                        {item.current_stock} units
                      </span>
                    </div>
                    <div className="inventory-detail-row">
                      <span className="inventory-detail-label">Pending Orders:</span>
                      <span className="inventory-detail-value">{item.pending_orders} units</span>
                    </div>
                  
                    {isItemRequested(item.id) && (
                      <div className="inventory-detail-row">
                        <span className="inventory-detail-label">Requested:</span>
                        <span className="inventory-detail-value">
                          <span className="requested-badge">
                            {requestedItems.find(ri => ri.id === item.id)?.quantity || 0} units
                          </span>
                        </span>
                      </div>
                    )}
                    

                  </div>
                  
                  {/* Status Indicators */}
                  <div className="status-indicators">
                    {item.is_out_of_stock && (
                      <div className="stock-indicator stock-critical">
                        🚨 Out of Stock
                      </div>
                    )}
                    {item.is_low_stock && !item.is_out_of_stock && (
                      <div className="stock-indicator stock-warning">
                        ⚠️ Low Stock
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Stock Actions */}
                <div className="inventory-actions">
                  {isItemRequested(item.id) ? (
                    <div className="stock-indicator requested-badge">
                      ✓ Stock Requested
                    </div>
                  ) : (
                    <div className="request-restock-form">
                      <div className="quantity-input">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >-</button>
                        <span className="quantity-value">
                          {requestQuantities[item.id] || 1}
                        </span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >+</button>
                      </div>
                      
                      <button 
                        className="request-btn"
                        onClick={() => handleRequestStock(item)}
                      >
                        Request Stock
                      </button>

                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <button 
          className="refresh-button"
          onClick={fetchInventory}
          title="Refresh Inventory Data"
        >
          ↻
        </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
