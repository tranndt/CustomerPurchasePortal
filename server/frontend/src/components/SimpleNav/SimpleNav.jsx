import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleNav = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('Customer');

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      // Get user role - for demo purposes, we'll determine based on username
      // In a real app, this would come from the backend
      if (storedUsername.includes('admin') || storedUsername === 'admin1') {
        setUserRole('Admin');
      } else if (storedUsername.includes('support')) {
        setUserRole('Support');
      } else {
        setUserRole('Customer');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/djangoapp/logout", {
        method: "GET",
        credentials: "include",
      });
      
      if (res.ok) {
        sessionStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
        setUserRole('Customer');
        navigate('/');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper function to render navigation links based on user role
  const renderNavigationLinks = () => {
    if (!isLoggedIn) return null;

    const baseLinks = (
      <button 
        onClick={() => navigate('/orders')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#007bff', 
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        My Orders
      </button>
    );

    if (userRole === 'Admin') {
      return (
        <div style={{ display: 'flex', gap: '15px' }}>
          {baseLinks}
          <button 
            onClick={() => navigate('/admin/orders')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#dc3545', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Admin Orders
          </button>
          <button 
            onClick={() => navigate('/admin/tickets')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#dc3545', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Admin Tickets
          </button>
        </div>
      );
    } else if (userRole === 'Support') {
      return (
        <div style={{ display: 'flex', gap: '15px' }}>
          {baseLinks}
          <button 
            onClick={() => navigate('/admin/tickets')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ffc107', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Support Tickets
          </button>
        </div>
      );
    } else {
      // Customer role - only show basic navigation
      return <div style={{ display: 'flex', gap: '15px' }}>{baseLinks}</div>;
    }
  };

  return (
    <nav style={{
      backgroundColor: '#f8f9fa',
      padding: '10px 20px',
      borderBottom: '1px solid #ddd',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h3 style={{ margin: 0, color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/')}>
          🛍️ Customer Purchase Portal
        </h3>
        
        {renderNavigationLinks()}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isLoggedIn ? (
          <>
            <span style={{ color: '#666' }}>
              Welcome, {username} 
              {userRole !== 'Customer' && (
                <span style={{ 
                  color: userRole === 'Admin' ? '#dc3545' : '#ffc107', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  ({userRole})
                </span>
              )}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
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
          </>
        )}
      </div>
    </nav>
  );
};

export default SimpleNav;
