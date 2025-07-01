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
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
            border: "1px solid #e9ecef"
          }}>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#2c3e50", 
              margin: "0 0 12px 0",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              📝 All Customer Reviews
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Monitor and moderate all customer product reviews
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
              <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📝</div>
              <h3 style={{ color: "#6c757d", marginBottom: "12px", fontSize: "24px" }}>No reviews found</h3>
              <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>Customer reviews will appear here once submitted.</p>
            </div>
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
