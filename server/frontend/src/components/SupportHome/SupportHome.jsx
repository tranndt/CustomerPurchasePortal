
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const SupportHome = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState({
    pendingTickets: 0,
    urgentTickets: 0,
    totalTickets: 0
  });

  const fetchBadgeCounts = useCallback(async () => {
    try {
      console.log('Fetching support badge counts...');
      const ticketsResponse = await fetch("http://localhost:8000/djangoapp/api/support/tickets", { credentials: 'include' });
      const ticketsData = await ticketsResponse.json();

      console.log('Support API response:', ticketsData);

      const newBadges = {
        pendingTickets: ticketsData.status === 200 ? 
          (ticketsData.tickets || []).filter(ticket => ticket.status === 'pending').length : 0,
        urgentTickets: ticketsData.status === 200 ? 
          (ticketsData.tickets || []).filter(ticket => ticket.priority === 'urgent').length : 0,
        totalTickets: ticketsData.status === 200 ? (ticketsData.tickets || []).length : 0
      };

      console.log('Calculated support badge counts:', newBadges);
      setBadges(newBadges);
    } catch (error) {
      console.error('Error fetching support badge counts:', error);
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
    
    // Check if user has correct role (support)
    if (userRole && userRole.toLowerCase() !== 'support') {
      if (userRole.toLowerCase() === 'customer') {
        navigate('/customer/home');
      } else if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
        navigate('/admin/home');
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
              Manage and resolve all customer support tickets and inquiries
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {/* All Tickets - Blue */}
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
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", // Blue gradient
                textAlign: 'center',
              }}
              onClick={() => navigate('/support/tickets')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(30, 64, 175, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(30, 64, 175, 0.25)";
              }}
            >
              {renderBadge(badges.totalTickets)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>🎫</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>All Tickets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>
                View and manage all customer support tickets
              </p>
            </div>

            {/* Pending Tickets - Amber */}
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
                background: "linear-gradient(135deg, #ffc107 0%, #b45309 100%)", // Amber gradient
                textAlign: 'center',
              }}
              onClick={() => navigate('/support/tickets?filter=pending')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(180, 83, 9, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(180, 83, 9, 0.25)";
              }}
            >
              {renderBadge(badges.pendingTickets)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>⏳</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>Pending Tickets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px" , textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>
                Review and respond to tickets waiting for attention
              </p>
            </div>

            {/* Urgent Tickets - Red */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 8px 15px rgba(185, 28, 28, 0.25)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                position: "relative",
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", // Red gradient
                textAlign: 'center',
              }}
              onClick={() => navigate('/support/tickets?filter=urgent')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(185, 28, 28, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 15px rgba(185, 28, 28, 0.25)";
              }}
            >
              {renderBadge(badges.urgentTickets)}
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#ffffff", display: 'flex', justifyContent: 'center', textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>🚨</div>
              <h3 style={{ margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center', fontSize: "26px" , textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)"}}>Urgent Tickets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#f8fafc", lineHeight: "1.5", fontSize: "15px", textShadow: "0 1px 2px rgba(0, 0, 0, 0.82)" }}>
                Handle high-priority tickets requiring immediate attention
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHome;
