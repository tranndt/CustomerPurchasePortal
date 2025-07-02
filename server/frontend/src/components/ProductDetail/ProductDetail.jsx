import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';
import BackButton from '../BackButton/BackButton';
import { showNotification } from '../Notification/Notification';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const product_url = `http://localhost:8000/djangoapp/api/products/${productId}`;
  const cart_add_url = "http://localhost:8000/djangoapp/api/cart/add";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(product_url);
        const data = await response.json();
        if (data.status === 200) {
          setProduct(data.product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error loading product: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    checkAuthStatus();
  }, [productId, product_url]);

  const checkAuthStatus = () => {
    const username = sessionStorage.getItem('username');
    setIsLoggedIn(!!username);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      const confirmLogin = window.confirm(
        'You need to log in to add items to your cart. Would you like to log in now?'
      );
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

    if (!product.is_in_stock) {
      showNotification('This product is out of stock', 'warning');
      return;
    }

    if (quantity > product.stock_quantity) {
      showNotification(`Only ${product.stock_quantity} items available in stock`, 'warning');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch(cart_add_url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        showNotification(`${quantity} item(s) added to cart successfully!`, 'success');
        // Trigger cart update event for navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        showNotification(data.message || 'Failed to add item to cart', 'error');
      }
    } catch (err) {
      showNotification('Error adding item to cart: ' + err.message, 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div className="product-detail-loading">
          <h2>Loading product...</h2>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <SimpleNav />
        <div className="product-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/shop')} className="back-btn">
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="product-detail-container">
        <BackButton />

        <div className="product-detail-content">
          {/* Product Image */}
          <div className="product-image-section">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="product-detail-image"
              />
            ) : (
              <div className="product-no-image">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-category">{product.category}</p>
            </div>

            <div className="product-price-section">
              <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
            </div>

            <div className="product-stock-section">
              {product.is_in_stock ? (
                <div className="in-stock">
                  <span className="stock-indicator in-stock-indicator">✓</span>
                  <span>In Stock ({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="out-of-stock">
                  <span className="stock-indicator out-of-stock-indicator">✗</span>
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            <div className="product-description-section">
              <h3>Description</h3>
              <p className="product-description">{product.description}</p>
            </div>

            {/* Add to Cart Section */}
            {product.is_in_stock && (
              <div className="add-to-cart-section">
                <div className="quantity-section">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-btn"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="quantity-input"
                      style={{ 
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                        margin: 0 
                      }}
                      onWheel={(e) => e.target.blur()}
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="quantity-btn"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.is_in_stock}
                  className="add-to-cart-btn"
                >
                  {addingToCart ? 'Adding to Cart...' : 
                   !isLoggedIn ? 'Login to Purchase' :
                   `Add ${quantity} to Cart`}
                </button>
              </div>
            )}

            {!product.is_in_stock && (
              <div className="out-of-stock-message">
                <p>This product is currently out of stock. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
