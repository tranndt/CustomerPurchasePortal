import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import API_URLS from '../../services/apiConfig';

const TicketDetail = () => {
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        // Determine the correct endpoint based on user role
        const userRole = sessionStorage.getItem('userRole');
        let endpoint = `${API_URLS.BASE_URL}/djangoapp/api/admin/tickets/${ticket_id}`;
        
        if (userRole && userRole.toLowerCase() === 'support') {
          endpoint = `${API_URLS.BASE_URL}/djangoapp/api/support/tickets/${ticket_id}`;
        }

        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include"
        });
        
        const data = await res.json();
        if (data.status === 200 && data.ticket) {
          setTicket(data.ticket);
          setStatus(data.ticket.status);
          setResolutionNote(data.ticket.resolution_note || "");
        } else {
          alert("Failed to load ticket details or unauthorized.");
          navigate(-1); // Go back to previous page
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        alert("Error loading ticket details.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [ticket_id, navigate]);

  const fetchTicketDetail = async () => {
    try {
      // Determine the correct endpoint based on user role
      const userRole = sessionStorage.getItem('userRole');
      let endpoint = `http://localhost:8000/djangoapp/api/admin/tickets/${ticket_id}`;
      
      if (userRole && userRole.toLowerCase() === 'support') {
        endpoint = `http://localhost:8000/djangoapp/api/support/tickets/${ticket_id}`;
      }

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include"
      });
      
      const data = await res.json();
      if (data.status === 200 && data.ticket) {
        setTicket(data.ticket);
        setStatus(data.ticket.status);
        setResolutionNote(data.ticket.resolution_note || "");
      } else {
        alert("Failed to load ticket details or unauthorized.");
        navigate(-1); // Go back to previous page
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      alert("Error loading ticket details.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async () => {
    if (!ticket) return;

    try {
      // Determine the correct endpoint based on user role
      const userRole = sessionStorage.getItem('userRole');
      let endpoint = `${API_URLS.BASE_URL}/djangoapp/api/admin/tickets/${ticket_id}/update`;
      
      if (userRole && userRole.toLowerCase() === 'support') {
        endpoint = `${API_URLS.BASE_URL}/djangoapp/api/support/tickets/${ticket_id}/update`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          status: status, 
          resolution_note: resolutionNote 
        })
      });

      const result = await res.json();
      if (result.status === 200) {
        alert("Ticket updated successfully!");
        // Refresh ticket data
        fetchTicketDetail();
      } else {
        alert("Failed to update ticket: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert("Error updating ticket.");
    }
  };

  const handleGoBack = () => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole && userRole.toLowerCase() === 'support') {
      navigate('/support/tickets');
    } else {
      navigate('/admin/tickets');
    }
  };

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <SimpleNav />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Ticket not found.</p>
          <button onClick={handleGoBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div style={{ 
        padding: "24px", 
        maxWidth: "1000px", 
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
          <div style={{ marginBottom: "24px" }}>
            <BackButton />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#2c3e50", 
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              🎫 Support Ticket #{ticket.ticket_id}
            </h1>
          </div>
          
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "24px", 
            borderRadius: "12px", 
            marginBottom: "32px",
            border: "1px solid #e9ecef"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    color: "#6c757d", 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    display: "block"
                  }}>
                    Customer
                  </label>
                  <p style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "#2c3e50", 
                    margin: "0" 
                  }}>
                    {ticket.customer}
                  </p>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    color: "#6c757d", 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    display: "block"
                  }}>
                    Product
                  </label>
                  <p style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "#2c3e50", 
                    margin: "0" 
                  }}>
                    {ticket.product}
                  </p>
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    color: "#6c757d", 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    display: "block"
                  }}>
                    Status
                  </label>
                  <div>
                    <span style={{ 
                      background: ticket.status === 'pending' ? 'linear-gradient(135deg, #ffc107, #ffb300)' : 
                                 ticket.status === 'approved' ? 'linear-gradient(135deg, #28a745, #20c997)' :
                                 ticket.status === 'rejected' ? 'linear-gradient(135deg, #dc3545, #e74c3c)' : 
                                 'linear-gradient(135deg, #6c757d, #495057)',
                      color: ticket.status === 'pending' ? '#000' : '#fff',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    color: "#6c757d", 
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    display: "block"
                  }}>
                    Submitted
                  </label>
                  <p style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "#2c3e50", 
                    margin: "0" 
                  }}>
                    {new Date(ticket.submitted).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "700", 
              color: "#2c3e50", 
              marginBottom: "12px" 
            }}>
              Issue Description
            </h3>
            <div style={{ 
              backgroundColor: "#fff", 
              border: "2px solid #e9ecef", 
              padding: "20px", 
              borderRadius: "8px",
              minHeight: "120px",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#495057"
            }}>
              {ticket.issue}
            </div>
          </div>

          {ticket.attachment && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "700", 
                color: "#2c3e50", 
                marginBottom: "12px" 
              }}>
                Attachment
              </h3>
              <a 
                href={ticket.attachment} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#007bff", 
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "8px",
                  border: "1px solid #bbdefb",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#bbdefb";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#e3f2fd";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📎 Download Attachment
              </a>
            </div>
          )}

          <div style={{ 
            background: "linear-gradient(135deg, #007bff, #0056b3)", 
            padding: "32px", 
            borderRadius: "12px",
            border: "1px solid #0056b3"
          }}>
            <h3 style={{ 
              fontSize: "20px", 
              fontWeight: "700", 
              color: "white", 
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              ⚙️ Update Ticket
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "700",
                color: "white",
                fontSize: "14px"
              }}>
                Status:
              </label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{ 
                  width: "200px", 
                  padding: "12px 16px", 
                  borderRadius: "8px", 
                  border: "2px solid #e9ecef",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "white",
                  color: "#495057"
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "700",
                color: "white",
                fontSize: "14px"
              }}>
                Resolution Note:
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Add notes about the resolution..."
                rows={4}
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: "8px", 
                  border: "2px solid #e9ecef",
                  resize: "vertical",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button 
              onClick={updateTicket}
              style={{ 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                padding: "12px 24px", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "700",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#218838";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(40, 167, 69, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#28a745";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
              }}
            >
              Update Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
