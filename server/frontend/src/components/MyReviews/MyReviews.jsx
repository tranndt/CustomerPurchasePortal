import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import '../../styles/ProductCard.css';

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
          maxWidth: "1000px", 
          margin: "0 auto"
        }}>
          <BackButton to="/customer/home" label="← Back to Customer Home" variant="primary" />
          
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
              ⭐ My Reviews
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              View and manage your product reviews
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
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>⭐</div>
              <h3 style={{ color: "#6c757d", marginBottom: "12px", fontSize: "24px" }}>No reviews found</h3>
              <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>You have not submitted any reviews yet.</p>
            </div>
          ) : (
            <div className="product-cards-grid">
              {reviews.map((review) => (
                <div key={review.id} className="product-card-shared">
                  <div className="product-card-content">
                    {/* Product Image */}
                    <div className="product-image-container small">
                      <img 
                        src={review.product_image || 'https://via.placeholder.com/100x100/f8f9fa/6c757d?text=No+Image'} 
                        alt={review.product_name}
                      />
                    </div>

                    {/* Review Details */}
                    <div className="product-details">
                      <h4 className="product-title">{review.product_name}</h4>
                      <div className="rating-display">
                        <span className="product-info-label">Rating:</span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`rating-star ${i < review.rating ? '' : 'empty'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="product-info-grid">
                        <div className="product-info-item">
                          <span className="product-info-label">Reviewed on:</span>
                          <span className="product-info-value">{new Date(review.created_on).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {review.review_text && (
                        <div className="review-text">
                          {review.review_text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
