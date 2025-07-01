import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    if (!storedUsername) {
      navigate('/');
      return;
    }
    if (userRole && userRole.toLowerCase() !== 'customer') {
      if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
        navigate('/admin/home');
      } else if (userRole.toLowerCase() === 'support') {
        navigate('/support/home');
      }
    } else {
      setUsername(storedUsername);
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
              Welcome to Your Dashboard
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Manage your orders, reviews, and support tickets
            </p>
          </div>

          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
            border: "1px solid #e9ecef",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white"
          }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600" }}>
              Welcome back, {username}! 👋
            </h3>
            <p style={{ margin: "0", fontSize: "14px", opacity: "0.9" }}>
              Quick access to your dashboard features below
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
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
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>My Orders</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                View your purchase history and order details
              </p>
              <button 
                onClick={() => navigate('/customer/orders')}
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
                View Orders
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
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>⭐</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>My Reviews</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                See and manage your product reviews
              </p>
              <button 
                onClick={() => navigate('/customer/reviews')}
                style={{
                  background: "linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 2px 4px rgba(255, 193, 7, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                My Reviews
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
              <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>Support</h3>
              <p style={{ margin: "0 0 20px 0", color: "#6c757d", lineHeight: "1.5" }}>
                Submit and track your support tickets
              </p>
              <button 
                onClick={() => navigate('/customer/tickets')}
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
                Support Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
