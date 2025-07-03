import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import '../../styles/global.css';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (!username) {
      navigate('/');
      return;
    }
    fetch(`http://localhost:8000/djangoapp/api/customer/tickets`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Tickets fetch error:', error);
        setLoading(false);
      });
  }, [navigate]);

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: { bg: 'linear-gradient(135deg, #ffc107, #ffb300)', color: '#000', shadow: 'rgba(255, 193, 7, 0.3)' },
      approved: { bg: 'linear-gradient(135deg, #28a745, #20c997)', color: '#fff', shadow: 'rgba(40, 167, 69, 0.3)' },
      rejected: { bg: 'linear-gradient(135deg, #dc3545, #e74c3c)', color: '#fff', shadow: 'rgba(220, 53, 69, 0.3)' },
      resolved: { bg: 'linear-gradient(135deg, #6c757d, #495057)', color: '#fff', shadow: 'rgba(108, 117, 125, 0.3)' }
    };
    
    const colors = statusColors[status] || statusColors.resolved;
    
    return (
      <span style={{
        background: colors.bg,
        color: colors.color,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: `0 2px 8px ${colors.shadow}`,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <SimpleNav />
      <div className="ticket-page-container">
        <div className="ticket-page-content">
          <BackButton to="/customer/home" label="← Back to Customer Home" variant="primary" />
          <div className="ticket-page-header">
            <h1 className="ticket-page-title">
              My Support Tickets
            </h1>
            <p className="ticket-page-subtitle">
              Track your support requests and resolutions
            </p>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px"
              }}></div>
              <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎫</div>
              <h3 style={{ color: "#6c757d", marginBottom: "12px", fontSize: "24px" }}>No support tickets found</h3>
              <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>You have not submitted any support tickets yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tickets.map((ticket) => (
                <div key={ticket.id} style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
                  border: "1px solid #e9ecef",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
                        <h4 style={{ margin: "0", color: "#2c3e50", fontSize: "20px" }}>{ticket.product_name}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "8px" }}>Issue Description:</span>
                        <p style={{ 
                          margin: "0", 
                          color: "#6c757d", 
                          lineHeight: "1.6",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef"
                        }}>
                          {ticket.issue_description}
                        </p>
                      </div>
                      {ticket.resolution_note && (
                        <div style={{ marginBottom: "16px" }}>
                          <span style={{ fontWeight: "600", color: "#28a745", display: "block", marginBottom: "8px" }}>Resolution:</span>
                          <p style={{ 
                            margin: "0", 
                            color: "#155724", 
                            lineHeight: "1.6",
                            padding: "12px",
                            backgroundColor: "#d4edda",
                            borderRadius: "8px",
                            border: "1px solid #c3e6cb"
                          }}>
                            {ticket.resolution_note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: "140px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#6c757d",
                        backgroundColor: "#f8f9fa",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid #e9ecef"
                      }}>
                        {new Date(ticket.submitted_on).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;
