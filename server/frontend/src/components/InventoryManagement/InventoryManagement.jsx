import React, { useState, useEffect, useCallback } from 'react';
import SimpleNav from '../SimpleNav/SimpleNav';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const inventory_url = "http://localhost:8000/djangoapp/api/manager/inventory";

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

  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(inventory.map(item => item.category))];

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
            <div className="stats-number">{categories.length}</div>
            <div className="stats-label">Categories</div>
          </div>
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
                  <div className="inventory-detail-row">
                    <span className="inventory-detail-label">Available After Pending:</span>
                    <span className={`inventory-detail-value ${item.available_after_pending <= 0 ? 'stock-critical' : item.available_after_pending <= 5 ? 'stock-warning' : 'stock-good'}`}>
                      {item.available_after_pending} units
                    </span>
                  </div>
                  {item.is_active === false && (
                    <div className="inventory-detail-row">
                      <span className="inventory-detail-label">Status:</span>
                      <span className="inventory-detail-value inactive">Inactive</span>
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
                  {!item.is_active && (
                    <div className="stock-indicator inactive">
                      🔒 Inactive Product
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
