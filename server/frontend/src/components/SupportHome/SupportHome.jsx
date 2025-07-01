
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const SupportHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    if (!username) {
      navigate('/');
      return;
    }
    if (userRole && userRole.toLowerCase() !== 'support') {
      if (userRole.toLowerCase() === 'customer') {
        navigate('/customer/home');
      } else if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
        navigate('/admin/home');
      }
    }
  }, [navigate]);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Support Dashboard</h1>
          <p>Manage and resolve all customer support tickets</p>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
            <h3>🎫 All Tickets</h3>
            <p>View and manage all support tickets</p>
            <button
              onClick={() => navigate('/support/tickets')}
              style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Go to Ticket Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHome;
