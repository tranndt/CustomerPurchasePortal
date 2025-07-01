import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛍️ Customer Purchase Portal
        </h1>
        
        <p style={{ 
          fontSize: '1.3rem', 
          marginBottom: '30px',
          opacity: 0.9,
          lineHeight: '1.6'
        }}>
          Your comprehensive solution for managing orders, product reviews, and support tickets. 
          Experience seamless shopping with our intuitive platform designed for customers, 
          administrators, and support teams.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#1e7e34';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Register
          </button>
        </div>
        
        <div style={{ 
          marginTop: '50px',
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Features</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            textAlign: 'left'
          }}>
            <div>
              <strong>🛒 Order Management</strong>
              <p style={{ margin: '5px 0', opacity: 0.8 }}>Track and manage your orders easily</p>
            </div>
            <div>
              <strong>⭐ Product Reviews</strong>
              <p style={{ margin: '5px 0', opacity: 0.8 }}>Share your experience with products</p>
            </div>
            <div>
              <strong>🎫 Support Tickets</strong>
              <p style={{ margin: '5px 0', opacity: 0.8 }}>Get help when you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
