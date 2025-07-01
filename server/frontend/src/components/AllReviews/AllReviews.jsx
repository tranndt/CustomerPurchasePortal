import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    
    // Check authentication and role
    if (!username) {
      navigate('/');
      return;
    }
    
    if (userRole && userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'manager') {
      navigate('/customer/home');
      return;
    }

    // Fetch all reviews
    fetch(`http://localhost:8000/djangoapp/api/admin/reviews`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('All reviews fetch result:', data);
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Reviews fetch error:', error);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>📝 All Customer Reviews</h2>
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#007bff' }}>{review.product_name}</h4>
                  <span style={{ 
                    color: '#666', 
                    fontSize: '12px',
                    backgroundColor: '#e9ecef',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Review #{review.id}
                  </span>
                </div>
                <p><strong>Customer:</strong> {review.customer_name}</p>
                <p><strong>Rating:</strong> {review.rating} / 5 ⭐</p>
                <p><strong>Review:</strong> {review.review_text}</p>
                <p><strong>Sentiment:</strong> 
                  <span style={{ 
                    color: review.sentiment === 'positive' ? '#28a745' : 
                          review.sentiment === 'negative' ? '#dc3545' : '#ffc107',
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {review.sentiment || 'neutral'}
                  </span>
                </p>
                <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0 0' }}>
                  Submitted: {new Date(review.created_on).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;
