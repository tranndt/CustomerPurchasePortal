import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleNav = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('Customer');

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const storedRole = sessionStorage.getItem('userRole');
    
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      
      // Use the stored role from backend, with fallback logic for demo purposes
      if (storedRole) {
        setUserRole(storedRole);
      } else {
        // Fallback logic for existing sessions without role
        let fallbackRole;
        if (storedUsername.includes('admin') || storedUsername === 'admin1') {
          fallbackRole = 'Admin';
        } else if (storedUsername.includes('manager') || storedUsername === 'manager1') {
          fallbackRole = 'Manager';
        } else if (storedUsername.includes('support')) {
          fallbackRole = 'Support';
        } else {
          fallbackRole = 'Customer';
        }
        setUserRole(fallbackRole);
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
        sessionStorage.removeItem('userRole');
        setIsLoggedIn(false);
        setUsername('');
        setUserRole('Customer');
        navigate('/'); // Redirect to landing page
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleHomeNavigation = () => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    // Navigate to role-specific home page
    if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
      navigate('/admin/home');
    } else if (userRole.toLowerCase() === 'support') {
      navigate('/support/home');
    } else {
      navigate('/customer/home');
    }
  };

  // Helper function to render navigation links based on user role
  const renderNavigationLinks = () => {
    if (!isLoggedIn) return null;

    if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
      return (
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/admin/orders')}
            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            All Orders
          </button>
          <button 
            onClick={() => navigate('/admin/reviews')}
            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            All Reviews
          </button>
          <button 
            onClick={() => navigate('/admin/tickets')}
            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            All Tickets
          </button>
        </div>
      );
    } else if (userRole.toLowerCase() === 'support') {
      return (
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/support/tickets')}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            Support Tickets
          </button>
        </div>
      );
    } else {
      // Customer role - show all customer navigation
      return (
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/customer/orders')}
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            My Orders
          </button>
          <button 
            onClick={() => navigate('/customer/reviews')}
            style={{ background: 'none', border: 'none', color: '#ffc107', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            My Reviews
          </button>
          <button 
            onClick={() => navigate('/customer/tickets')}
            style={{ background: 'none', border: 'none', color: '#28a745', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            My Tickets
          </button>
        </div>
      );
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
        <h3 style={{ margin: 0, color: '#007bff', cursor: 'pointer' }} onClick={handleHomeNavigation}>
          🛍️ Customer Purchase Portal
        </h3>
        
        {renderNavigationLinks()}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isLoggedIn ? (
          <>
            <span style={{ color: '#666' }}>
              Welcome, {username} 
              {userRole.toLowerCase() !== 'customer' && (
                <span style={{ 
                  color: userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager' ? '#dc3545' : '#ffc107', 
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
