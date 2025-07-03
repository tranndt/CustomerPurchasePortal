import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      color: 'white',
      padding: 0,
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
    }}>
      {/* Left: Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px',
        background: 'transparent',
      }}>
        <div className="site-name" style={{
          fontSize: '3.5rem',
          marginBottom: 10,
        }}>
          ElectronicsRetail™
        </div>
        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: 700,
          marginBottom: '16px',
          textShadow: '2px 2px 8px rgba(0,0,0,0.15)',
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
        }}>
          Powering Your Tech Journey
        </h1>
        <p style={{
          fontSize: '1.2rem',
          maxWidth: 500,
          opacity: 0.95,
          lineHeight: 1.6,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
        }}>
          Discover cutting-edge electronics, track your orders, and manage all your purchases in one place. Built to serve both shoppers and store staff.
        </p>
      </div>

      {/* Right: Actions */}
      <div style={{
        flex: 1,
        background: 'white',
        color: '#2c3e50',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        boxShadow: '-2px 0 16px 0 rgba(0,0,0,0.05)',
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif` }}>
          Welcome to Your Account Portal
        </h2>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif` }}>🛒 Shop Now</h3>
          <p style={{ fontSize: '1rem', marginBottom: '10px', color: '#555', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif` }}>
            Explore our latest tech products and buy directly from your personalized storefront.
          </p>
          <button
            onClick={() => navigate('/shop')}
            style={{
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: '0.3s',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#d68910'}
            onMouseOut={e => e.target.style.backgroundColor = '#f39c12'}
          >
            Browse Store
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif` }}>🔐 Sign In</h3>
          <p style={{ fontSize: '1rem', marginBottom: '10px', color: '#555', fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif` }}>
            Log in as a customer or store manager to view orders, manage inventory, or leave reviews.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#2980b9',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: '0.3s',
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`,
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#21618c'}
            onMouseOut={e => e.target.style.backgroundColor = '#2980b9'}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
