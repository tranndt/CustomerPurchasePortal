import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.css';
import './SimpleNav.css';

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
        return 'My Account';
    }
  };

  return (
    <nav className="simple-nav">
      <div className="simple-nav-left">
        <h3 className="company-name" onClick={() => navigate('/')}>
          ElectronicsRetail™
        </h3>
        <button 
          onClick={() => navigate('/shop')}
          className="nav-link shop"
        >
          Shop
        </button>
        {isLoggedIn && (
          <button 
            onClick={() => navigate(getHomeLink())}
            className="nav-link home"
          >
            {getHomeLinkText()}
          </button>
        )}
      </div>
      <div className="simple-nav-right">
        {isLoggedIn ? (
          <>
            <span className="welcome-text">
              Welcome, <span className="welcome-name">{userFullName}</span>
              {userRole && (
                <span className={`user-role ${
                  userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager'
                    ? 'admin-role'
                    : userRole.toLowerCase() === 'support'
                    ? 'support-role'
                    : userRole.toLowerCase() === 'customer'
                    ? 'customer-role'
                    : ''
                }`}>
                  {userRole}
                </span>
              )}
            </span>
            {/* Show something only for customers */}
            {userRole && userRole.toLowerCase() === 'customer' && (
              <span className="customer-special">
                {/* Add customer-specific content here */}
              </span>
            )}
            <button 
              onClick={handleLogout}
              className="nav-button logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')}
              className="nav-button login"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="nav-button register"
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
