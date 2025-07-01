import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    if (!storedUsername) {
      navigate('/');
      return;
    }
    if (userRole && userRole.toLowerCase() !== 'customer') {
      if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
        navigate('/admin/home');
      } else if (userRole.toLowerCase() === 'support') {
        navigate('/support/home');
      }
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Welcome to Your Dashboard</h1>
          <p>Manage your orders, reviews, and support tickets</p>
        </header>
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Welcome back, {username}! 👋</h3>
          <p style={{ margin: '5px 0', color: '#666' }}>Quick access to your dashboard features below</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📦 My Orders</h3>
            <p>View your purchase history and order details</p>
            <button 
              onClick={() => navigate('/customer/orders')}
              style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              View Orders
            </button>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>⭐ My Reviews</h3>
            <p>See and manage your product reviews</p>
            <button 
              onClick={() => navigate('/customer/reviews')}
              style={{ backgroundColor: '#ffc107', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              My Reviews
            </button>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>🎫 Support</h3>
            <p>Submit and track your support tickets</p>
            <button 
              onClick={() => navigate('/customer/tickets')}
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Support Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
