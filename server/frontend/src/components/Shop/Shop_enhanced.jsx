import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';
import './Shop.css';

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const products_url = "http://localhost:8000/djangoapp/api/products";
  const categories_url = "http://localhost:8000/djangoapp/api/products/categories";
  const cart_url = "http://localhost:8000/djangoapp/api/cart";
  const cart_update_url = "http://localhost:8000/djangoapp/api/cart/update";
  const cart_remove_url = "http://localhost:8000/djangoapp/api/cart/remove";
  const checkout_url = "http://localhost:8000/djangoapp/api/cart/checkout";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkAuthStatus();
    // Check for tab parameter
    const tabParam = searchParams.get('tab');
    if (tabParam === 'cart') {
      setActiveTab('cart');
    }
  }, [searchParams]);

  const fetchCart = async () => {
    if (!isLoggedIn) return;
    
    setCartLoading(true);
    try {
      const response = await fetch(cart_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        setCartItems(data.cart_items);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = () => {
    const username = sessionStorage.getItem('username');
    setIsLoggedIn(!!username);
  };

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

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeCartItem(cartItemId);
      return;
    }

    try {
      const response = await fetch(cart_update_url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: newQuantity
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        setCartItems(prev => prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: newQuantity, total_price: isNaN(parseFloat(data.cart_item.total_price)) ? 0 : parseFloat(data.cart_item.total_price) }
            : item
        ));
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (err) {
      alert('Error updating item: ' + err.message);
    }
  };

  const removeCartItem = async (cartItemId) => {
    try {
      const response = await fetch(cart_remove_url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Failed to remove item');
      }
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const confirmCheckout = window.confirm(
      `Proceed with checkout for ${cartItems.length} item(s)?`
    );

    if (!confirmCheckout) return;

    try {
      const response = await fetch(checkout_url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      if (data.status === 200) {
        alert('Order placed successfully!');
        setCartItems([]);
        setActiveTab('browse');
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      alert('Error during checkout: ' + err.message);
    }
  };

  // Get cart quantity for a specific product
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.product_id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle product card click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Filter and paginate products
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category change - reset to page 1
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle search change - reset to page 1
  const handleSearchChange = (search) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const itemTotal = isNaN(parseFloat(item.total_price)) ? 0 : parseFloat(item.total_price);
    return total + itemTotal;
  }, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SimpleNav />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="shop-container">
        <div className="shop-header">
          <h1 className="shop-title">ElectronicsRetail Store</h1>
          <p className="shop-subtitle">
            Browse our collection of electronics and technology products {isLoggedIn ? 'and manage your cart' : '- login to start shopping'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="shop-tabs">
          <button 
            className={`shop-tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Products ({products.length})
          </button>
          {isLoggedIn && (
            <button 
              className={`shop-tab ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              My Cart ({cartCount})
            </button>
          )}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="browse-section">
            <div className="browse-layout">
              {/* Left Panel - Category Filter */}
              <div className="category-panel">
                <h3 className="category-panel-title">Categories</h3>
                <div className="category-list">
                  <button
                    className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('')}
                  >
                    All Categories ({products.length})
                  </button>
                  {categories.map(category => {
                    const categoryCount = products.filter(p => p.category === category).length;
                    return (
                      <button
                        key={category}
                        className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category} ({categoryCount})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content */}
              <div className="main-content">
                {/* Search and Info */}
                <div className="top-controls">
                  <div className="search-section">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="results-info">
                    Showing {currentProducts.length} of {filteredProducts.length} products
                    {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="products-grid">
                  {currentProducts.map(product => {
                    const cartQuantity = getCartQuantity(product.id);
                    return (
                      <div 
                        key={product.id} 
                        className="product-card clickable"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="product-image"
                          />
                        )}
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{product.category}</p>
                          <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                          
                          {/* Stock Status and Cart Status */}
                          <div className="product-status-row">
                            <div className="stock-status">
                              {!product.is_in_stock ? (
                                <span className="out-of-stock-badge">Out of Stock</span>
                              ) : product.stock_quantity <= 5 ? (
                                <span className="low-stock-badge">Low Stock</span>
                              ) : (
                                <span className="in-stock-badge">Available</span>
                              )}
                            </div>
                            
                            {cartQuantity > 0 && (
                              <div className="cart-status">
                                <span className="in-cart-indicator">
                                  🛒 {cartQuantity}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and 2 pages around current
                      const showPage = pageNumber === 1 || 
                                      pageNumber === totalPages || 
                                      Math.abs(pageNumber - currentPage) <= 2;
                      
                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                          return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}

                {filteredProducts.length === 0 && (
                  <div className="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && isLoggedIn && (
          <div className="cart-section">
            {cartLoading ? (
              <div className="cart-loading">Loading cart...</div>
            ) : cartItems.length === 0 ? (
              <div className="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button 
                  onClick={() => setActiveTab('browse')}
                  className="browse-btn"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-summary">
                  <h3>Cart Summary</h3>
                  <p><strong>Items:</strong> {cartCount}</p>
                  <p><strong>Total:</strong> ${cartTotal.toFixed(2)}</p>
                  <button 
                    onClick={handleCheckout}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                </div>

                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.product_name}</h4>
                        <p className="cart-item-category">{item.product_category}</p>
                      </div>
                      
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="cart-item-total">
                          ${(isNaN(parseFloat(item.total_price)) ? 0 : parseFloat(item.total_price)).toFixed(2)}
                        </div>
                        
                        <button 
                          onClick={() => removeCartItem(item.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guest message for cart tab */}
        {activeTab === 'cart' && !isLoggedIn && (
          <div className="guest-cart-message">
            <h3>Login Required</h3>
            <p>Please log in to view and manage your cart.</p>
            <div className="auth-buttons">
              <button 
                onClick={() => navigate('/login')}
                className="login-btn"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="register-btn"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
