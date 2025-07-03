import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleNav = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Function to check authentication state
    const checkAuthState = () => {
      const username = sessionStorage.getItem('username');
      const firstName = sessionStorage.getItem('firstName');
      const lastName = sessionStorage.getItem('lastName');
      const role = sessionStorage.getItem('userRole');
      
      if (username) {
        setIsLoggedIn(true);
        setUserRole(role || 'customer');
        // Create full name from first and last name, fallback to username
        if (firstName && lastName) {
          setUserFullName(`${firstName} ${lastName}`);
        } else if (firstName) {
          setUserFullName(firstName);
        } else {
          setUserFullName(username);
        }
      } else {
        setIsLoggedIn(false);
        setUserFullName('');
        setUserRole('');
      }
    };

    // Check initial state
    checkAuthState();

    // Listen for storage events (when sessionStorage changes in other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'username' || e.key === 'firstName' || e.key === 'lastName' || e.key === 'userRole') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event listener for same-tab sessionStorage changes
    const handleCustomStorageChange = () => {
      checkAuthState();
    };

    window.addEventListener('sessionStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionStorageChange', handleCustomStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch('http://localhost:8000/djangoapp/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('firstName');
        sessionStorage.removeItem('lastName');
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('sessionStorageChange'));
        
        // Update state
        setIsLoggedIn(false);
        setUserFullName('');
        setUserRole('');
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear session storage
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('firstName');
      sessionStorage.removeItem('lastName');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('sessionStorageChange'));
      
      setIsLoggedIn(false);
      setUserFullName('');
      setUserRole('');
      navigate('/');
    }
  };

  const getHomeLink = () => {
    const role = userRole?.toLowerCase();
    switch (role) {
      case 'admin':
      case 'manager':
        return '/admin/home';
      case 'support':
        return '/support/home';
      case 'customer':
      default:
        return '/customer/home';
    }
  };

  const getHomeLinkText = () => {
    const role = userRole?.toLowerCase();
    switch (role) {
      case 'admin':
      case 'manager':
        return 'Admin Home';
      case 'support':
        return 'Support Home';
      case 'customer':
      default:
        return 'Customer Home';
    }
  };

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
        {isLoggedIn && (
          <button 
            onClick={() => navigate(getHomeLink())}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#007bff', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {getHomeLinkText()}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isLoggedIn ? (
          <>
            <span style={{ fontSize: '14px', marginRight: '10px' }}>
              Welcome, {userFullName}
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
          </>
        )}
      </div>
    </nav>
  );
};

export default SimpleNav;
