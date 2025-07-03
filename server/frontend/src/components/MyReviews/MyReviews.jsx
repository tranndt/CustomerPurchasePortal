import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';
import '../../styles/global.css';

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'all'
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [canSubmit, setCanSubmit] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (!username) {
      navigate('/');
      return;
    }
    
    // Fetch user's own reviews
    fetch(`http://localhost:8000/djangoapp/api/customer/reviews`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
        
        // Check if user has already submitted a review today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const hasReviewedToday = (data.reviews || []).some(review => {
          const reviewDate = new Date(review.created_on).toISOString().split('T')[0];
          return reviewDate === today;
        });
        setCanSubmit(!hasReviewedToday);
      })
      .catch((error) => {
        console.error('Reviews fetch error:', error);
        setLoading(false);
      });
      
    // Fetch all public reviews
    fetch(`http://localhost:8000/djangoapp/api/reviews/public`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setAllReviews(data.reviews || []);
        setLoadingAll(false);
      })
      .catch((error) => {
        console.error('All reviews fetch error:', error);
        setLoadingAll(false);
      });
  }, [navigate]);

  const submitReview = async () => {
    if (!canSubmit) {
      showNotification("You can only submit one review per day.", 'warning');
      return;
    }

    if (!reviewText.trim()) {
      showNotification("Please enter your review.", 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/djangoapp/api/customer/review/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          review: reviewText,
          rating,
        }),
      });

      const result = await response.json();
      if (result.status === 200) {
        showNotification("Thank you for your feedback!", 'success');
        // Refresh reviews list and update can submit status
        setCanSubmit(false);
        // Add the new review to the list
        const newReview = result.review || {
          id: Date.now(), // temporary id
          review_text: reviewText,
          rating: rating,
          created_on: new Date().toISOString(),
        };
        setReviews([newReview, ...reviews]);
        // Clear the form
        setReviewText("");
        setRating(5);
      } else {
        showNotification("Failed to submit review: " + (result.message || "Unknown error"), 'error');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showNotification("Error submitting review. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const renderRatingStars = () => (
    <div className="rating-input">
      {[...Array(5)].map((_, i) => (
        <span 
          key={i} 
          className={`rating-star ${i < rating ? 'filled' : 'empty'}`}
          onClick={() => handleRatingChange(i + 1)}
          style={{ cursor: 'pointer', fontSize: '28px' }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const renderWriteReviewTab = () => (
    <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)" }}>
      {canSubmit ? (
        <div>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>Share Your Shopping Experience</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#495057" }}>
              Rating
            </label>
            {renderRatingStars()}
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#495057" }}>
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of your shopping experience with us? Was it easy to navigate? Did you receive good service?"
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ced4da",
                fontSize: "14px"
              }}
            />
          </div>
          <button
            onClick={submitReview}
            disabled={loading || !canSubmit}
            style={{
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: loading || !canSubmit ? "0.7" : "1"
            }}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
          <h3 style={{ color: "#2c3e50", marginBottom: "12px" }}>Thank you for your feedback!</h3>
          <p style={{ color: "#6c757d", margin: "0 0 20px 0" }}>You have already submitted a review today. You can leave another review tomorrow.</p>
        </div>
      )}
    </div>
  );

  const renderMyReviewsTab = () => (
    <div>
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
          <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>You have not submitted any feedback yet.</p>
        </div>
      ) : (
        <div className="product-cards-grid">
          {reviews.map((review) => (
            <div key={review.id} className="product-card-shared">
              <div className="product-card-content">
                <div className="product-details" style={{ width: "100%" }}>
                  <div className="rating-display" style={{ marginBottom: "15px" }}>
                    <span className="product-info-label">Rating:</span>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`rating-star ${i < review.rating ? '' : 'empty'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="product-info-grid">
                    <div className="product-info-item">
                      <span className="product-info-label">Submitted on:</span>
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
  );

  const renderAllReviewsTab = () => (
    <div>
      {loadingAll ? (
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
          <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading all reviews...</p>
        </div>
      ) : allReviews.length === 0 ? (
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
          <p style={{ color: "#adb5bd", margin: "0", fontSize: "16px" }}>Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="product-cards-grid">
          {allReviews.map((review) => (
            <div key={review.id} className="product-card-shared">
              <div className="product-card-content">
                <div className="product-details" style={{ width: "100%" }}>
                  <h4 className="product-title" style={{ color: "#495057", marginBottom: "10px" }}>
                    {review.customer_name || "Anonymous Customer"}
                  </h4>
                  <div className="rating-display" style={{ marginBottom: "15px" }}>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`rating-star ${i < review.rating ? '' : 'empty'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="product-info-grid">
                    <div className="product-info-item">
                      <span className="product-info-label">Submitted on:</span>
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
  );

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
              ⭐ Shopping Experience Feedback
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Share your thoughts about your shopping experience
            </p>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            marginBottom: "24px" 
          }}>
            <button
              onClick={() => setActiveTab('write')}
              style={{
                flex: "1",
                marginRight: "12px",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === 'write' ? "#667eea" : "#f8f9fa",
                color: activeTab === 'write' ? "white" : "#495057",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeTab === 'write' ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none"
              }}
            >
              Leave Feedback
            </button>
            <button
              onClick={() => setActiveTab('myReviews')}
              style={{
                flex: "1",
                marginRight: "12px",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === 'myReviews' ? "#667eea" : "#f8f9fa",
                color: activeTab === 'myReviews' ? "white" : "#495057",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeTab === 'myReviews' ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none"
              }}
            >
              My Feedback
            </button>
            <button
              onClick={() => setActiveTab('allReviews')}
              style={{
                flex: "1",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: activeTab === 'allReviews' ? "#667eea" : "#f8f9fa",
                color: activeTab === 'allReviews' ? "white" : "#495057",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeTab === 'allReviews' ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none"
              }}
            >
              All Feedback
            </button>
          </div>

          {activeTab === 'write' && renderWriteReviewTab()}
          {activeTab === 'myReviews' && renderMyReviewsTab()}
          {activeTab === 'allReviews' && renderAllReviewsTab()}
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
