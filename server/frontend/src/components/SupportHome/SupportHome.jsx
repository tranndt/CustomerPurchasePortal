import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../Home/Home';

const SupportHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user is authenticated
    if (!username) {
      navigate('/');
      return;
    }
    
    // Check if user has correct role (support)
    if (userRole && userRole.toLowerCase() !== 'support') {
      // Redirect to their appropriate home page
      if (userRole.toLowerCase() === 'customer') {
        navigate('/customer/home');
      } else if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
        navigate('/admin/home');
      }
    }
  }, [navigate]);

  return <Home />;
};

export default SupportHome;
