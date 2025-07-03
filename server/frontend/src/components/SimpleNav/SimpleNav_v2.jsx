import React from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleNav = () => {
  const navigate = useNavigate();

  return (
    <nav style={{ 
      padding: '10px 20px', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h3 style={{ margin: 0, color: '#007bff' }}>ElectronicsRetail™</h3>
        <button 
          onClick={() => navigate('/shop')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#28a745', 
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Store
        </button>
      </div>
      <div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '10px'
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
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Register
        </button>
      </div>
    </nav>
  );
};

export default SimpleNav;
