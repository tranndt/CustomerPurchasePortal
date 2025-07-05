/**
 * API Configuration Service
 *
 * This module provides API URLs that adapt to different environments,
 * using relative paths that work in both development and production.
 */

// API base URL - in production this will be a relative path to the current domain
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin // Use the current domain and protocol
  : 'http://localhost:8000'; 

// Django API endpoints
export const API_URLS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/djangoapp/api/products`,
  PRODUCT_CATEGORIES: `${API_BASE_URL}/djangoapp/api/products/categories`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/djangoapp/api/products/${id}`,
  
  // Cart
  CART: `${API_BASE_URL}/djangoapp/api/cart`,
  CART_UPDATE: `${API_BASE_URL}/djangoapp/api/cart/update`,
  CART_REMOVE: `${API_BASE_URL}/djangoapp/api/cart/remove`,
  CART_CHECKOUT: `${API_BASE_URL}/djangoapp/api/cart/checkout`,
  
  // User authentication
  LOGIN: `${API_BASE_URL}/djangoapp/login`,
  LOGOUT: `${API_BASE_URL}/djangoapp/logout`,
  REGISTER: `${API_BASE_URL}/djangoapp/register`,
  DEMO_USERS: `${API_BASE_URL}/djangoapp/api/demo-users`,
  
  // Customer endpoints
  ORDERS: `${API_BASE_URL}/djangoapp/api/customer/orders`,
  TICKETS: `${API_BASE_URL}/djangoapp/api/customer/tickets`,
  NEW_SUPPORT: `${API_BASE_URL}/djangoapp/api/customer/support/new`,
  ORDER_BY_TRANSACTION: (id) => `${API_BASE_URL}/djangoapp/api/order-by-transaction/${id}`,
  
  // Admin/manager endpoints
  PENDING_ORDERS: `${API_BASE_URL}/djangoapp/api/manager/orders/pending`,
  INVENTORY: `${API_BASE_URL}/djangoapp/api/manager/inventory`,
  REVIEWS: `${API_BASE_URL}/djangoapp/api/manager/reviews`,
  SUPPORT_TICKETS: `${API_BASE_URL}/djangoapp/api/manager/tickets`,
  SUPPORT_TICKETS_API: `${API_BASE_URL}/djangoapp/api/support/tickets`,
};

/**
 * Standard fetch wrapper with error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const fetchApi = async (url, options = {}) => {
  try {
    // Set default headers
    const defaultOptions = {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };
    
    const response = await fetch(url, defaultOptions);
    
    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

export default API_URLS;

// Also export as named export with BASE_URL for backward compatibility
export { API_BASE_URL as BASE_URL };
API_URLS.BASE_URL = API_BASE_URL;
