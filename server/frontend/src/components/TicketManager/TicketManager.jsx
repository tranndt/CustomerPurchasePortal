import React, { useEffect, useState } from "react";
import SimpleNav from "../SimpleNav/SimpleNav";

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const res = await fetch("http://localhost:8000/djangoapp/api/tickets", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (data.status === 200) {
      setTickets(data.tickets);
    } else {
      alert("Failed to load tickets or unauthorized.");
    }
  };

  const updateTicket = async (ticketId, status, resolution_note) => {
    const res = await fetch(`http://localhost:8000/djangoapp/api/tickets/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, resolution_note })
    });
    const result = await res.json();
    if (result.status === 200) {
      alert("Ticket updated.");
      fetchTickets();  // refresh list
    } else {
      alert("Failed to update.");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2>🎧 Support Ticket Manager (Admin)</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        tickets.map((ticket, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
            <h4>{ticket.product} — {ticket.customer}</h4>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Submitted:</strong> {new Date(ticket.submitted).toLocaleDateString()}</p>
            <p><strong>Issue:</strong> {ticket.issue}</p>
            {ticket.attachment && <a href={ticket.attachment} target="_blank" rel="noopener noreferrer">Download Attachment</a>}

            <div style={{ marginTop: "10px" }}>
              <label>Status: </label>
              <select onChange={(e) => updateTicket(ticket.ticket_id, e.target.value, "")} defaultValue={ticket.status}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div style={{ marginTop: "10px" }}>
              <textarea
                placeholder="Resolution note (optional)"
                onBlur={(e) => updateTicket(ticket.ticket_id, ticket.status, e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default TicketManager;
