import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (!username) {
      navigate('/');
      return;
    }
    fetch(`http://localhost:8000/djangoapp/api/customer/reviews`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('Reviews fetch result:', data);
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
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>My Reviews</h2>
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>You have not submitted any reviews yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                <h4>{review.product_name}</h4>
                <p><strong>Rating:</strong> {review.rating} / 5</p>
                <p><strong>Review:</strong> {review.review_text}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>Submitted: {new Date(review.created_on).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
