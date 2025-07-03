import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const AdminHome = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState({
    pendingOrders: 0,
    outOfStock: 0,
    newReviews: 0,
    newTickets: 0
  });

  const fetchBadgeCounts = useCallback(async () => {
    try {
      console.log('Fetching badge counts...');
      const [pendingResponse, inventoryResponse, reviewsResponse, ticketsResponse] = await Promise.all([
        fetch("http://localhost:8000/djangoapp/api/manager/orders/pending", { credentials: 'include' }),
        fetch("http://localhost:8000/djangoapp/api/manager/inventory", { credentials: 'include' }),
        fetch("http://localhost:8000/djangoapp/api/manager/reviews", { credentials: 'include' }),
        fetch("http://localhost:8000/djangoapp/api/manager/tickets", { credentials: 'include' })
      ]);

      const [pendingData, inventoryData, reviewsData, ticketsData] = await Promise.all([
        pendingResponse.json(),
        inventoryResponse.json(),
        reviewsResponse.json(),
        ticketsResponse.json()
      ]);

      console.log('API responses:', { pendingData, inventoryData, reviewsData, ticketsData });

      const newBadges = {
        pendingOrders: pendingData.status === 200 ? (pendingData.orders || []).length : 0,
        outOfStock: inventoryData.status === 200 ? 
          (inventoryData.inventory || []).filter(item => item.stock_quantity === 0).length : 0,
        newReviews: reviewsData.status === 200 ? 
          (reviewsData.reviews || []).filter(review => review.moderated === false).length : 0,
        newTickets: ticketsData.status === 200 ? 
          (ticketsData.tickets || []).filter(ticket => ticket.status === 'pending').length : 0
      };

      console.log('Calculated badge counts:', newBadges);
      setBadges(newBadges);
    } catch (error) {
      console.error('Error fetching badge counts:', error);
    }
  }, []);

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
      return;
    }

    // Fetch badge counts
    fetchBadgeCounts();
  }, [navigate, fetchBadgeCounts]);

  const renderBadge = (count) => {
    if (count === 0) return null;
    return (
      <span style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: '#ffc107', // yellow
        color: '#212529', // dark text for contrast
        borderRadius: '10px',
        minWidth: '44px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(220, 53, 69, 0.10)',
        zIndex: 10,
        // border: '3px solid #fff', // removed white border
        letterSpacing: '1px',
        padding: '0 12px',
        transition: 'transform 0.15s',
      }}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ 
        padding: "94px 24px 24px 24px", // 70px for navbar + 24px original padding
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "40px",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
            border: "1px solid #e9ecef"
          }}>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#2c3e50", 
              margin: "0 0 12px 0",
              background: "linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(4, 0, 85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Admin Dashboard
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Administrative oversight and management of all customer orders and support operations
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Order Fulfillment - Blue */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 15px rgba(30, 64, 175, 0.25)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", // Blue gradient: lighter to darker
                textAlign: 'center',
              }}
              onClick={() => navigate('/admin/fulfillment')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(30, 64, 175, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(30, 64, 175, 0.25)";
              }}
            >
              {renderBadge(badges.pendingOrders)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>⚡</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>Order Fulfillment</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>
                Manage all incoming orders, track statuses, and view order history
              </p>
            </div>

            {/* Inventory Management - Green */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 15px rgba(22, 101, 52, 0.25)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                background: "linear-gradient(135deg, #22c55e 0%, #166534 100%)", // Green gradient: lighter to darker
                textAlign: 'center',
              }}
              onClick={() => navigate('/admin/inventory')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(22, 101, 52, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(22, 101, 52, 0.25)";
              }}
            >
              {renderBadge(badges.outOfStock)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>📊</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>Manage Inventory</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5" , fontSize: "15px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>
                Monitor product inventory levels, request and track incoming stock
              </p>
            </div>

            {/* Support Tickets - Amber */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 15px rgba(180, 83, 9, 0.25)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                background: "linear-gradient(135deg, #ffc107 0%, #b45309 100%)", // Amber gradient: lighter to darker
                textAlign: 'center',
              }}
              onClick={() => navigate('/admin/tickets')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(180, 83, 9, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(180, 83, 9, 0.25)";
              }}
            >
              {renderBadge(badges.newTickets)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>🎫</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>Support Tickets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px" , textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>
                Manage customer support tickets and inquiries
              </p>
            </div>

            {/* Reviews - Purple */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 15px rgba(126, 34, 206, 0.25)",
                border: "1px solid rgba(162, 89, 236, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                background: "linear-gradient(135deg, #a259ec 0%, #7e22ce 100%)", // Purple gradient: lighter to darker
                textAlign: 'center',
              }}
              onClick={() => navigate('/admin/reviews')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(126, 34, 206, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(126, 34, 206, 0.25)";
              }}
            >
              {renderBadge(badges.newReviews)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>📝</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" , textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>Customer Feedback</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>
                View and moderate all customer product reviews
              </p>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
