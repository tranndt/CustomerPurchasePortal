import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user is authenticated
    if (!username) {
      navigate('/');
      return;
    }
    
    // Check if user has correct role (admin or manager)
    if (userRole && userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'manager') {
      // Redirect to their appropriate home page
      if (userRole.toLowerCase() === 'customer') {
        navigate('/customer/home');
      } else if (userRole.toLowerCase() === 'support') {
        navigate('/support/home');
      }
    }
  }, [navigate]);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Admin Dashboard</h1>
          <p>Administrative oversight and management of all customer orders and support operations</p>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📦 All Orders</h3>
            <p>Monitor, review, and process all customer orders across the system</p>
            <button
              onClick={() => navigate('/admin/orders')}
              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              All Orders
            </button>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📝 All Reviews</h3>
            <p>View and moderate all customer product reviews</p>
            <button
              onClick={() => navigate('/admin/reviews')}
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              All Reviews
            </button>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>🎫 All Tickets</h3>
            <p>Oversee, assign, and resolve all customer support tickets and inquiries</p>
            <button
              onClick={() => navigate('/admin/tickets')}
              style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              All Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
