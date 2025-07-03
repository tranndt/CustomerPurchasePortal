import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      color: 'white',
      padding: 0,
    }}>
      {/* Left: Company Info */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        padding: '60px 32px',
        minWidth: 0,
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>🛒</div>
        <h1 style={{
          fontSize: '2.7rem',
          fontWeight: 800,
          marginBottom: '16px',
          textShadow: '2px 2px 8px rgba(0,0,0,0.10)'
        }}>
          ElectronicsRetail™
        </h1>
        <p style={{
          fontSize: '1.25rem',
          maxWidth: 420,
          margin: '0 auto',
          opacity: 0.93,
          lineHeight: 1.7,
        }}>
          Your destination for the latest electronics and technology. Shop, track orders, and manage your account—all in one place.
        </p>
      </div>

      {/* Right: Shop & Login */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        color: '#2c3e50',
        padding: '60px 32px',
        minWidth: 0,
        boxShadow: '-2px 0 16px 0 rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
        }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '15px 36px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.13)',
              transition: 'all 0.3s',
              minWidth: '180px',
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#e0a800';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#ffc107';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🛍️ Browse Store
          </button>
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
              boxShadow: '0 4px 15px rgba(0,0,0,0.13)',
              transition: 'all 0.3s',
              minWidth: '120px',
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
