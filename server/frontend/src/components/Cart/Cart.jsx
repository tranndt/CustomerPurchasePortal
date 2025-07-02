import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [checkingOut, setCheckingOut] = useState(false);

  const cart_url = "http://localhost:8000/djangoapp/api/cart";
  const cart_update_url = "http://localhost:8000/djangoapp/api/cart/update";
  const cart_remove_url = "http://localhost:8000/djangoapp/api/cart/remove";
  const checkout_url = "http://localhost:8000/djangoapp/api/cart/checkout";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch(cart_url, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 200) {
        // Ensure proper number parsing for all cart items
        const processedCartItems = data.cart_items.map(item => {
          // Handle potential string prices or undefined values
          const itemPrice = item.product.price;
          const totalPrice = item.total_price;
          
          // Convert to number, handling strings, decimals, or undefined
          const parsedPrice = isNaN(parseFloat(itemPrice)) ? 0 : parseFloat(itemPrice);
          const parsedTotal = isNaN(parseFloat(totalPrice)) ? 0 : parseFloat(totalPrice);
          
          return {
            ...item,
            product: {
              ...item.product,
              price: parsedPrice
            },
            total_price: parsedTotal
          };
        });
        setCartItems(processedCartItems);
      } else if (data.status === 401) {
        setError('Please log in to view your cart');
      } else {
        setError('Failed to load cart');
      }
    } catch (err) {
      setError('Error loading cart: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(cartItemId);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));

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
            ? { 
                ...item, 
                quantity: newQuantity, 
                total_price: isNaN(parseFloat(data.cart_item.total_price)) ? 0 : parseFloat(data.cart_item.total_price)
              }
            : item
        ));
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (err) {
      alert('Error updating item: ' + err.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));

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
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const checkout = async () => {
    setCheckingOut(true);

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
        alert(`Purchase completed successfully! Transaction ID: ${data.transaction_id}`);
        setCartItems([]); // Clear cart
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Redirect to orders page to see the new purchase
        setTimeout(() => {
          navigate('/customer/orders');
        }, 2000);
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      alert('Error during checkout: ' + err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = isNaN(parseFloat(item.total_price)) ? 0 : parseFloat(item.total_price);
      return total + itemTotal;
    }, 0);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">
          <h2>Loading cart...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          {error.includes('log in') && (
            <a href="/login" className="login-link">Go to Login</a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="cart-container">
      {/* Navigation Bar */}
      <div className="cart-nav">
        <button 
          onClick={() => navigate('/customer/home')}
          className="nav-btn back-btn"
        >
          ← Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/shop')}
          className="nav-btn shop-btn"
        >
          🛍️ Continue Shopping
        </button>
      </div>

      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Browse our products and add items to your cart.</p>
          <a href="/shop" className="browse-products-btn">
            Browse Products
          </a>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.product.image_url || 'https://via.placeholder.com/100x100/f8f9fa/6c757d?text=No+Image'} 
                    alt={item.product.name}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="stock-info">
                    {item.product.is_in_stock ? (
                      <span className="in-stock">✓ In Stock ({item.product.stock_quantity} available)</span>
                    ) : (
                      <span className="out-of-stock">✗ Out of Stock</span>
                    )}
                  </p>
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItems[item.id] || item.quantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems[item.id] || item.quantity >= item.product.stock_quantity}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <p className="total-price">${(isNaN(parseFloat(item.total_price)) ? 0 : parseFloat(item.total_price)).toFixed(2)}</p>
                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={updatingItems[item.id]}
                    className="remove-btn"
                  >
                    {updatingItems[item.id] ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-section">
              <button 
                onClick={checkout}
                disabled={checkingOut || cartItems.some(item => !item.product.is_in_stock)}
                className="checkout-btn"
              >
                {checkingOut ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
              
              {cartItems.some(item => !item.product.is_in_stock) && (
                <p className="checkout-warning">
                  Some items in your cart are out of stock. Please remove them to proceed.
                </p>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Cart;
