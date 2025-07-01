import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

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
      let endpoint = `http://localhost:8000/djangoapp/api/admin/tickets/${ticket_id}/update`;
      
      if (userRole && userRole.toLowerCase() === 'support') {
        endpoint = `http://localhost:8000/djangoapp/api/support/tickets/${ticket_id}/update`;
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
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={handleGoBack}
            style={{ 
              backgroundColor: "#6c757d", 
              color: "white", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
          >
            ← Back to Tickets
          </button>
        </div>

        <h2>🎫 Support Ticket #{ticket.ticket_id}</h2>
        
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px" 
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <p><strong>Customer:</strong> {ticket.customer}</p>
              <p><strong>Product:</strong> {ticket.product}</p>
              <p><strong>Submitted:</strong> {new Date(ticket.submitted).toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Current Status:</strong> 
                <span style={{ 
                  marginLeft: "8px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: ticket.status === 'pending' ? '#ffc107' : 
                                 ticket.status === 'approved' ? '#28a745' :
                                 ticket.status === 'rejected' ? '#dc3545' : '#6c757d',
                  color: ticket.status === 'pending' ? '#000' : '#fff',
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {ticket.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4>Issue Description:</h4>
          <div style={{ 
            backgroundColor: "#fff", 
            border: "1px solid #dee2e6", 
            padding: "15px", 
            borderRadius: "4px",
            minHeight: "100px"
          }}>
            {ticket.issue}
          </div>
        </div>

        {ticket.attachment && (
          <div style={{ marginBottom: "20px" }}>
            <h4>Attachment:</h4>
            <a 
              href={ticket.attachment} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              📎 Download Attachment
            </a>
          </div>
        )}

        <div style={{ 
          backgroundColor: "#fff", 
          border: "2px solid #007bff", 
          padding: "20px", 
          borderRadius: "8px" 
        }}>
          <h4>Update Ticket</h4>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Status:
            </label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ 
                width: "200px", 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #ccc" 
              }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Resolution Note:
            </label>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add notes about the resolution..."
              rows={4}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "4px", 
                border: "1px solid #ccc",
                resize: "vertical"
              }}
            />
          </div>

          <button 
            onClick={updateTicket}
            style={{ 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              padding: "10px 20px", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Update Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
