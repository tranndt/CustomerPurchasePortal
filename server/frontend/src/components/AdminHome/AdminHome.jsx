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
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>📦</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>All Orders</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                Monitor, review, and process all customer orders across the system
              </p>
              <button
                onClick={() => navigate('/admin/orders')}
                style={{
                  background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(220, 53, 69, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                All Orders
              </button>
            </div>

            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
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
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
            }}>
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
