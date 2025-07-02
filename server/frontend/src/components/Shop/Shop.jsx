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
  const [addingToCart, setAddingToCart] = useState({});
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const products_url = "http://localhost:8000/djangoapp/api/products";
  const categories_url = "http://localhost:8000/djangoapp/api/products/categories";
  const cart_url = "http://localhost:8000/djangoapp/api/cart";
  const cart_add_url = "http://localhost:8000/djangoapp/api/cart/add";
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

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      // Redirect to login for guests
      const confirmLogin = window.confirm(
        'You need to log in to add items to your cart. Would you like to log in now?'
      );
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

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
          quantity: quantity
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        alert('Item added to cart successfully!');
        fetchCart(); // Refresh cart
        // Trigger cart update event for navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      alert('Error adding item to cart: ' + err.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
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
            ? { ...item, quantity: newQuantity, total_price: data.cart_item.total_price }
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Show all products regardless of stock status - let users see what's available
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((total, item) => total + parseFloat(item.total_price), 0);
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
            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-group">
                <select
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
              <div className="filter-info">
                Showing {filteredProducts.length} products
              </div>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
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
                    <p className="product-description">{product.description}</p>
                    <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                    <div className="product-stock">
                      {product.is_in_stock ? 
                        `${product.stock_quantity} in stock` : 
                        'Out of stock'
                      }
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id, 1)}
                      disabled={!product.is_in_stock || addingToCart[product.id]}
                      className={`add-to-cart-btn ${!product.is_in_stock ? 'disabled' : ''}`}
                    >
                      {addingToCart[product.id] ? 'Adding...' : 
                       !product.is_in_stock ? 'Out of Stock' :
                       isLoggedIn ? 'Add to Cart' : 'Login to Purchase'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or category filter.</p>
              </div>
            )}
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
                        <p className="cart-item-price">${parseFloat(item.product_price).toFixed(2)} each</p>
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
                          ${parseFloat(item.total_price).toFixed(2)}
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
