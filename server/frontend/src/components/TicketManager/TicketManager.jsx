import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import './TicketManager.css';

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
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
      
      if (data.status === 403) {
        setError('Access denied. Admin/Support privileges required.');
        return;
      }
      
      if (data.status !== 200) {
        throw new Error('Failed to fetch tickets');
      }
      
      setTickets(data.tickets || []);
    } catch (err) {
      setError('Failed to load tickets: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter tickets by status
  const openTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'pending');
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress');
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed');

  const handleViewTicket = (ticketId) => {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole && userRole.toLowerCase() === 'support') {
      navigate(`/support/tickets/${ticketId}`);
    } else {
      navigate(`/admin/tickets/${ticketId}`);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`ticket-status status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderTicketCards = (ticketsToShow) => {
    if (ticketsToShow.length === 0) {
      return (
        <div className="no-tickets">
          <h3>No tickets in this category</h3>
          <p>Tickets will appear here when they match this status.</p>
        </div>
      );
    }

    return (
      <div className="tickets-grid">
        {ticketsToShow.map((ticket) => (
          <div key={ticket.ticket_id} className="ticket-card">
            {/* Ticket Image/Icon */}
            <div className="ticket-image">
              {ticket.product_image ? (
                <img src={ticket.product_image} alt={ticket.product} />
              ) : (
                <span>🎫</span>
              )}
            </div>
            
            <div className="ticket-content">
              <div className="ticket-header">
                <div className="ticket-id">Ticket #{ticket.ticket_id}</div>
                {getStatusBadge(ticket.status)}
              </div>
              
              <div className="ticket-details compact">
                <div className="ticket-detail-row">
                  <span className="ticket-detail-label">Customer:</span>
                  <span className="ticket-detail-value">{ticket.customer}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="ticket-detail-label">Product:</span>
                  <span className="ticket-detail-value">{ticket.product}</span>
                </div>
                <div className="ticket-detail-row">
                  <span className="ticket-detail-label">Issue:</span>
                  <span className="ticket-detail-value ticket-issue">{ticket.issue}</span>
                </div>
                {ticket.assigned_to && (
                  <div className="ticket-detail-row">
                    <span className="ticket-detail-label">Assigned To:</span>
                    <span className="ticket-detail-value">{ticket.assigned_to}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="ticket-actions">
              <button
                className="action-button view-button"
                onClick={() => handleViewTicket(ticket.ticket_id)}
              >
                View & Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <SimpleNav />
        <div className="tickets-management">
          <div className="tickets-container">
            <div className="loading">
              <h2>Loading tickets...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SimpleNav />
        <div className="tickets-management">
          <div className="tickets-container">
            <div className="error">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchTickets}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="tickets-management">
        <div className="tickets-container">
          <BackButton />
          {/* Header */}
          <div className="tickets-header">
            <h1 className="tickets-title">Ticket Management</h1>
            <p className="tickets-subtitle">
              Oversee, assign, and resolve all customer support tickets and inquiries
            </p>
          </div>

          {/* Statistics Dashboard */}
          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-number">{openTickets.length}</div>
              <div className="stats-label">Open</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{inProgressTickets.length}</div>
              <div className="stats-label">In Progress</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{resolvedTickets.length}</div>
              <div className="stats-label">Resolved</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{closedTickets.length}</div>
              <div className="stats-label">Closed</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{tickets.length}</div>
              <div className="stats-label">Total Tickets</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">
                {tickets.length > 0 ? ((resolvedTickets.length / tickets.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="stats-label">Resolution Rate</div>
            </div>
          </div>

          {/* Tabs Container */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Tickets ({tickets.length})
              </button>
              <button 
                className={`tab ${activeTab === 'open' ? 'active' : ''}`}
                onClick={() => setActiveTab('open')}
              >
                Open ({openTickets.length})
              </button>
              <button 
                className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('progress')}
              >
                In Progress ({inProgressTickets.length})
              </button>
              <button 
                className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved ({resolvedTickets.length})
              </button>
              <button 
                className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
                onClick={() => setActiveTab('closed')}
              >
                Closed ({closedTickets.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'all' && renderTicketCards(tickets)}
              {activeTab === 'open' && renderTicketCards(openTickets)}
              {activeTab === 'progress' && renderTicketCards(inProgressTickets)}
              {activeTab === 'resolved' && renderTicketCards(resolvedTickets)}
              {activeTab === 'closed' && renderTicketCards(closedTickets)}
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            className="refresh-button"
            onClick={fetchTickets}
            title="Refresh Tickets"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketManager;
