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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
                  border: "1px solid #e9ecef",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 16px 0", color: "#2c3e50", fontSize: "20px" }}>{review.product_name}</h4>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ fontWeight: "600", color: "#495057", marginRight: "12px" }}>Rating:</span>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ 
                              color: i < review.rating ? "#ffc107" : "#e9ecef", 
                              fontSize: "18px",
                              marginRight: "2px"
                            }}>★</span>
                          ))}
                          <span style={{ marginLeft: "8px", color: "#6c757d", fontWeight: "600" }}>
                            {review.rating} / 5
                          </span>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "8px" }}>Review:</span>
                        <p style={{ 
                          margin: "0", 
                          color: "#6c757d", 
                          lineHeight: "1.6",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e9ecef"
                        }}>
                          {review.review_text}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "140px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#6c757d",
                        backgroundColor: "#f8f9fa",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid #e9ecef"
                      }}>
                        {new Date(review.created_on).toLocaleDateString()}
                      </span>
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
