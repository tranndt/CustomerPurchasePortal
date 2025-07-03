import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';
import '../../styles/global.css';
import './MyReviews.css';

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'myReviews'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
    // No longer fetching all public reviews
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
    <div className="rating-select">
      {[...Array(5)].map((_, i) => (
        <span 
          key={i} 
          className={`rating-star ${i < rating ? 'filled' : ''}`}
          onClick={() => handleRatingChange(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );

  const renderWriteReviewTab = () => (
    <div className="review-form">
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
            className="submit-button"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "20px" }}>✅</div>
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
        <div className="my-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="my-review-card">
              <div className="my-review-content">
                <div className="my-review-header">
                  <span className="my-review-rating-label">Rating:</span>
                  <div className="my-review-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`rating-star ${i < review.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <span className="my-review-date">{new Date(review.created_on).toLocaleDateString()}</span>
                </div>
                {review.review_text && (
                  <div className="my-review-text">
                    {review.review_text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Removed renderAllReviewsTab

  return (
    <div>
      <SimpleNav />
      <div className="review-page-container">
        <div className="review-page-content">
          <BackButton to="/customer/home" label="← Back to Customer Home" variant="primary" />
          
          <div className="review-page-header">
            <h1 className="review-page-title">
              Shopping Experience Feedback
            </h1>
            <p className="review-page-subtitle">
              Share your thoughts about your shopping experience
            </p>
          </div>

          <div className="review-tabs">
            <div 
              className={`review-tab ${activeTab === 'write' ? 'active' : ''}`}
              onClick={() => setActiveTab('write')}
            >
              Leave Feedback
            </div>
            <div
              className={`review-tab ${activeTab === 'myReviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('myReviews')}
            >
              My Feedback
            </div>
          </div>

          {activeTab === 'write' && renderWriteReviewTab()}
          {activeTab === 'myReviews' && renderMyReviewsTab()}
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
