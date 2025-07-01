import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

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

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>My Support Tickets</h2>
        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>You have not submitted any support tickets yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                <h4>{ticket.product_name}</h4>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Issue:</strong> {ticket.issue_description}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>Submitted: {new Date(ticket.submitted_on).toLocaleString()}</p>
                {ticket.resolution_note && (
                  <p style={{ color: '#28a745', fontSize: '13px' }}><strong>Resolution:</strong> {ticket.resolution_note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
