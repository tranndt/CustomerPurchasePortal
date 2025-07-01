import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Determine the correct endpoint based on user role
      const userRole = sessionStorage.getItem('userRole');
      let endpoint = "http://localhost:8000/djangoapp/api/admin/tickets";
      
      if (userRole && userRole.toLowerCase() === 'support') {
        endpoint = "http://localhost:8000/djangoapp/api/support/tickets";
      }
      
      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.status === 200) {
        setTickets(data.tickets);
      } else {
        alert("Failed to load tickets or unauthorized.");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      alert("Error loading tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticketId) => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole && userRole.toLowerCase() === 'support') {
      navigate(`/support/tickets/${ticketId}`);
    } else {
      navigate(`/admin/tickets/${ticketId}`);
    }
  };

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

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div style={{ 
          padding: "24px", 
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
            border: "1px solid #e9ecef"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }}></div>
            <p style={{ 
              fontSize: "16px", 
              color: "#6c757d",
              margin: "0",
              fontWeight: "500"
            }}>
              Loading tickets...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div style={{ 
        padding: "24px", 
        maxWidth: "1400px", 
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ 
              fontSize: "28px", 
              fontWeight: "600", 
              color: "#2c3e50", 
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              🎫 Support Ticket Manager
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              View and manage all customer support tickets
            </p>
          </div>
          
          {tickets.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "2px dashed #dee2e6"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
              <h3 style={{ color: "#6c757d", marginBottom: "8px" }}>No tickets found</h3>
              <p style={{ color: "#adb5bd", margin: "0" }}>Support tickets will appear here when customers submit them.</p>
            </div>
          ) : (
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "80px 2fr 120px 120px 2fr 120px",
                gap: "16px",
                padding: "16px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                color: "#495057",
                marginBottom: "16px",
                border: "1px solid #e9ecef"
              }}>
                <div>ID</div>
                <div>Customer & Product</div>
                <div>Status</div>
                <div>Submitted</div>
                <div>Issue Description</div>
                <div style={{ textAlign: "center" }}>Actions</div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tickets.map((ticket, index) => (
                  <div 
                    key={ticket.ticket_id} 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "80px 2fr 120px 120px 2fr 120px", 
                      gap: "16px", 
                      padding: "20px",
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e3f2fd";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#f8f9fa";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ 
                      fontWeight: "700", 
                      color: "#007bff",
                      fontSize: "14px"
                    }}>
                      #{ticket.ticket_id}
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontWeight: "600", 
                        color: "#2c3e50",
                        fontSize: "15px",
                        marginBottom: "4px"
                      }}>
                        {ticket.customer}
                      </div>
                      <div style={{ 
                        fontSize: "13px", 
                        color: "#6c757d",
                        fontWeight: "500"
                      }}>
                        {ticket.product}
                      </div>
                    </div>
                    
                    <div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    
                    <div style={{ 
                      fontSize: "13px",
                      color: "#6c757d",
                      fontWeight: "500"
                    }}>
                      {new Date(ticket.submitted).toLocaleDateString()}
                    </div>
                    
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#495057",
                      lineHeight: "1.4"
                    }}>
                      {ticket.issue.length > 80 
                        ? ticket.issue.substring(0, 80) + "..." 
                        : ticket.issue}
                    </div>
                    
                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleViewTicket(ticket.ticket_id)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#0056b3";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 8px rgba(0, 123, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#007bff";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 4px rgba(0, 123, 255, 0.2)";
                        }}
                      >
                        View & Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketManager;
