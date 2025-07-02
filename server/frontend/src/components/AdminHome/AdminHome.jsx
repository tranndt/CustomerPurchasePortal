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
    console.log('Rendering badge with count:', count);
    if (count === 0) return null;
    return (
      <span style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
        zIndex: 10
      }}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ 
        padding: "24px", 
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
              {renderBadge(badges.pendingOrders)}
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚡</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>Order Fulfillment</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                Comprehensive order management with all statuses: pending, approved, cancelled, and fulfilled orders
              </p>
              <button
                onClick={() => navigate('/admin/fulfillment')}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Order Fulfillment
              </button>
            </div>

            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
              {renderBadge(badges.outOfStock)}
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>📊</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>Inventory Management</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                Monitor stock levels, track pending orders, and manage product inventory
              </p>
              <button
                onClick={() => navigate('/admin/inventory')}
                style={{
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Manage Inventory
              </button>
            </div>

            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
              {renderBadge(badges.newReviews)}
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>📝</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>All Reviews</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                View and moderate all customer product reviews
              </p>
              <button
                onClick={() => navigate('/admin/reviews')}
                style={{
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                All Reviews
              </button>
            </div>

            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
              {renderBadge(badges.newTickets)}
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>🎫</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>All Tickets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                Oversee, assign, and resolve all customer support tickets and inquiries
              </p>
              <button
                onClick={() => navigate('/admin/tickets')}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                All Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
