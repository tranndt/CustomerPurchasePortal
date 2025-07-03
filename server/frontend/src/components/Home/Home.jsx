import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is logged in by checking sessionStorage
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Welcome to Your Dashboard</h1>
          <p>Manage your orders, reviews, and support tickets</p>
        </header>

        {isLoggedIn ? (
          <div>
            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Welcome back, {username}! 👋</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>Quick access to your dashboard features below</p>
            </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>📦 My Orders</h3>
              <p>View your purchase history and order details</p>
              <button 
                onClick={() => navigate('/orders')}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
              >
                View Orders
              </button>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>⭐ Reviews</h3>
              <p>Leave reviews for your purchased products</p>
              <button 
                onClick={() => navigate('/orders')}
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Write Review
              </button>
            </div>
            
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>🎧 Support</h3>
              <p>Get help with your orders and products</p>
              <button 
                onClick={() => navigate('/orders')}
                style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Get Support
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '8px' }}>
              <h2>Welcome to ElectronicsRetail™</h2>
              <p>Please log in to access your orders, reviews, and support tickets.</p>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <h3>Features:</h3>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                <li>View and manage your orders</li>
                <li>Write reviews for purchased products</li>
                <li>Submit and track support tickets</li>
                <li>Admin panel for managers</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
