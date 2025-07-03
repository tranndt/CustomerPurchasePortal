import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [userFullName, setUserFullName] = useState('');

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const firstName = sessionStorage.getItem('firstName');
    const lastName = sessionStorage.getItem('lastName');
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
      // Create full name from first and last name, fallback to username
      if (firstName && lastName) {
        setUserFullName(`${firstName} ${lastName}`);
      } else if (firstName) {
        setUserFullName(firstName);
      } else {
        setUserFullName(storedUsername);
      }
    }
  }, [navigate]);

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
              color: "8c757d", 
              margin: "0 0 12px 0",
              WebkitBackgroundClip: "text",
              // WebkitTextFillColor: "transparent"
            }}>
              My Account Dashboard
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
            boxShadow: "0 8px 15px rgba(118, 75, 162, 0.25)",
            border: "1px solid rgba(102, 126, 234, 0.3)",
            background: "linear-gradient(135deg,rgba(177, 102, 234, 0.98) 0%,rgba(118, 75, 162, 0.85) 100%)",
            color: "white"
          }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600" }}>
              Welcome back, {userFullName}! 👋
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
            

            {/* My Orders Card - Blue */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 15px rgba(30, 64, 175, 0.25)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", // Blue gradient: lighter to darker
              position: "relative",
              textAlign: "center"
            }}
            onClick={() => navigate('/customer/orders')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(30, 64, 175, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(30, 64, 175, 0.25)";
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center' }}>📦</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" }}>Orders</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5" }}>
                View your purchase history and order details
              </p>
              {/* No button needed as the entire card is clickable */}
            </div>

            {/* Support Card - Amber */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 15px rgba(180, 83, 9, 0.25)",
              border: "1px solid rgba(255, 193, 7, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              background: "linear-gradient(135deg, #ffc107 0%, #b45309 100%)", // Amber gradient: lighter to darker
              position: "relative",
              textAlign: "center"
            }}
            onClick={() => navigate('/customer/tickets')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(180, 83, 9, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(180, 83, 9, 0.25)";
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center' }}>🎫</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" }}>Support</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5" }}>
                Submit and track your support tickets
              </p>
              {/* No button needed as the entire card is clickable */}
            </div>

            {/* Feedback Card - Green */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 15px rgba(22, 101, 52, 0.25)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              background: "linear-gradient(135deg, #22c55e 0%, #166534 100%)", // Green gradient: lighter to darker
              position: "relative",
              textAlign: "center"
            }}
            onClick={() => navigate('/customer/reviews')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(22, 101, 52, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(22, 101, 52, 0.25)";
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center' }}>⭐</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" }}>Feedback</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5" }}>
                See and manage your shopping experience reviews and feedback
              </p>
              {/* No button needed as the entire card is clickable */}
            </div>
{/* Browse Products Card - Purple */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 15px rgba(126, 34, 206, 0.25)",
              border: "1px solid rgba(162, 89, 236, 0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              background: "linear-gradient(135deg, #a259ec 0%, #7e22ce 100%)", // Purple gradient: lighter to darker
              position: "relative",
              textAlign: "center"
            }}
            onClick={() => navigate('/shop')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(126, 34, 206, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 15px rgba(126, 34, 206, 0.25)";
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center' }}>🛍️</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" }}>Shop</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5" }}>
                Browse our complete electronics catalog and find great products
              </p>
              {/* No button needed as the entire card is clickable */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
