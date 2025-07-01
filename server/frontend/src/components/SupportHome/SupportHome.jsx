
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
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{ 
          maxWidth: "800px", 
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
              Support Dashboard
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Manage and resolve all customer support tickets
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef",
              minWidth: "400px",
              textAlign: "center",
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
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎫</div>
              <h3 style={{ margin: "0 0 16px 0", color: "#2c3e50", fontSize: "24px" }}>All Tickets</h3>
              <p style={{ margin: "0 0 24px 0", color: "#6c757d", lineHeight: "1.5", fontSize: "16px" }}>
                View and manage all support tickets
              </p>
              <button
                onClick={() => navigate('/support/tickets')}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                Go to Ticket Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHome;
