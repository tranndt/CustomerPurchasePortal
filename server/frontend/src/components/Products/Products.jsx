import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  const products_url = "http://localhost:8000/djangoapp/api/products";
  const categories_url = "http://localhost:8000/djangoapp/api/products/categories";
  const cart_add_url = "http://localhost:8000/djangoapp/api/cart/add";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(products_url);
      const data = await response.json();
      if (data.status === 200) {
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(categories_url);
      const data = await response.json();
      if (data.status === 200) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const addToCart = async (productId) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await fetch(cart_add_url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        // Update local cart state
        setCartItems(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + 1
        }));
        
        // Show success message
        alert('Item added to cart successfully!');
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">
          <h2>Loading products...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Navigation Bar */}
      <div className="products-nav">
        <button 
          onClick={() => navigate('/customer/home')}
          className="nav-btn back-btn"
        >
          ← Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/shop')}
          className="nav-btn cart-btn"
        >
          🛒 View Cart
        </button>
      </div>

      <div className="products-header">
        <h1>All Products</h1>
        <p>Browse our complete product catalog</p>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="filter-section">
          <label htmlFor="search">Search Products:</label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <label htmlFor="category">Filter by Category:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="results-count">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img 
                src={product.image_url || '/api/placeholder/300/200'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image';
                }}
              />
              {!product.is_in_stock && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            <div className="product-info">
              <div className="product-category">{product.category || 'General'}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-price">
                <span className="price">${product.price.toFixed(2)}</span>
              </div>

              <div className="product-stock">
                {product.is_in_stock ? (
                  <span className="in-stock">
                    ✓ In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="out-of-stock">
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              <div className="product-actions">
                <button
                  className={`add-to-cart-btn ${!product.is_in_stock ? 'disabled' : ''}`}
                  onClick={() => addToCart(product.id)}
                  disabled={!product.is_in_stock || addingToCart[product.id]}
                >
                  {addingToCart[product.id] ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="cart-icon">🛒</span>
                      Add to Cart
                    </>
                  )}
                </button>
                
                {cartItems[product.id] && (
                  <div className="cart-quantity">
                    In cart: {cartItems[product.id]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
