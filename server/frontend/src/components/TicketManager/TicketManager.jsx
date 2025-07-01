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
      pending: { bg: '#ffc107', color: '#000' },
      approved: { bg: '#28a745', color: '#fff' },
      rejected: { bg: '#dc3545', color: '#fff' },
      resolved: { bg: '#6c757d', color: '#fff' }
    };
    
    const colors = statusColors[status] || { bg: '#6c757d', color: '#fff' };
    
    return (
      <span style={{
        backgroundColor: colors.bg,
        color: colors.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2>🎫 Support Ticket Manager</h2>
        
        {tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No tickets found.</p>
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "auto 1fr auto auto auto auto", 
              gap: "10px", 
              padding: "10px",
              backgroundColor: "#f8f9fa",
              fontWeight: "bold",
              borderRadius: "4px"
            }}>
              <div>ID</div>
              <div>Customer & Product</div>
              <div>Status</div>
              <div>Submitted</div>
              <div>Issue Preview</div>
              <div>Actions</div>
            </div>
            
            {tickets.map((ticket) => (
              <div 
                key={ticket.ticket_id} 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "auto 1fr auto auto auto auto", 
                  gap: "10px", 
                  padding: "15px",
                  borderBottom: "1px solid #dee2e6",
                  alignItems: "center"
                }}
              >
                <div style={{ fontWeight: "bold", color: "#007bff" }}>
                  #{ticket.ticket_id}
                </div>
                
                <div>
                  <div style={{ fontWeight: "bold" }}>{ticket.customer}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>{ticket.product}</div>
                </div>
                
                <div>
                  {getStatusBadge(ticket.status)}
                </div>
                
                <div style={{ fontSize: "14px" }}>
                  {new Date(ticket.submitted).toLocaleDateString()}
                </div>
                
                <div style={{ fontSize: "14px", maxWidth: "200px" }}>
                  {ticket.issue.length > 50 
                    ? ticket.issue.substring(0, 50) + "..." 
                    : ticket.issue}
                </div>
                
                <div>
                  <button
                    onClick={() => handleViewTicket(ticket.ticket_id)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    View & Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManager;
