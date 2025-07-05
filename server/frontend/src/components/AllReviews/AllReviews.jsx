import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleNav from '../SimpleNav/SimpleNav';
import API_URLS from '../../services/apiConfig';
import './AllReviews.css';
import BackButton from '../BackButton/BackButton';

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/djangoapp/api/admin/reviews`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.status === 403) {
        setError('Access denied. Admin/Manager privileges required.');
        return;
      }
      
      if (data.status !== 200) {
        throw new Error('Failed to fetch reviews');
      }
      
      setReviews(data.reviews || []);
    } catch (err) {
      setError('Failed to load reviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('userRole');
    
    // Check authentication and role
    if (!username) {
      navigate('/');
      return;
    }
    
    // Allow Demo Admin explicit access
    const isDemoAdmin = username?.toLowerCase().includes('demo_admin');
    
    // Check role for regular users
    if (!isDemoAdmin && userRole && userRole.toLowerCase() !== 'admin' && userRole.toLowerCase() !== 'manager') {
      navigate('/customer/home');
      return;
    }

    fetchReviews();
  }, [navigate, fetchReviews]);

  // Filter reviews by category
  const newReviews = reviews.filter(review => !review.moderated);
  const moderatedReviews = reviews.filter(review => review.moderated);
  const positiveReviews = reviews.filter(review => review.sentiment === 'positive');
  const negativeReviews = reviews.filter(review => review.sentiment === 'negative');

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderReviewCards = (reviewsToShow) => {
    if (reviewsToShow.length === 0) {
      return (
        <div className="no-reviews">
          <h3>No reviews in this category</h3>
          <p>Reviews will appear here when they match this filter.</p>
        </div>
      );
    }

    return (
      <div className="reviews-grid">
        {reviewsToShow.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-product">
                <h4>{review.is_product_review ? review.product_name : "Shopping Experience"}</h4>
                <span className="review-customer">by {review.customer_name}</span>
              </div>
              <div className="review-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
                <span className="rating-value">{review.rating}/5</span>
              </div>
            </div>
            
            <div className="review-content">
              <p>{review.review_text}</p>
            </div>
            
            <div className="review-meta">
              {review.sentiment && (
                <span className={`sentiment-badge sentiment-${review.sentiment}`}>
                  {review.sentiment}
                </span>
              )}
              <span className={`moderation-badge ${review.moderated ? 'moderated' : 'new'}`}>
                {review.moderated ? 'Moderated' : 'New'}
              </span>
              <span className="review-date">
                {new Date(review.created_on).toLocaleDateString()}
              </span>
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
        <div className="reviews-management">
          <div className="reviews-container">
            <div className="loading">
              <h2>Loading reviews...</h2>
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
        <div className="reviews-management">
          <div className="reviews-container">
            <div className="error">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchReviews}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimpleNav />
      <div className="reviews-management">
        <div className="reviews-container">
          {/* Back Button */}
          <BackButton to="/admin/home" label="← Back to Admin Home" variant="primary" />

          {/* Header */}
          <div className="reviews-header">
            <h1 className="reviews-title">Review Management</h1>
            <p className="reviews-subtitle">
              Monitor and moderate all customer product reviews
            </p>
          </div>

          {/* Statistics Dashboard */}
          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-number">{newReviews.length}</div>
              <div className="stats-label">New Reviews</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{moderatedReviews.length}</div>
              <div className="stats-label">Moderated</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{positiveReviews.length}</div>
              <div className="stats-label">Positive</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{negativeReviews.length}</div>
              <div className="stats-label">Negative</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{reviews.length}</div>
              <div className="stats-label">Total Reviews</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{getAverageRating()}</div>
              <div className="stats-label">Average Rating</div>
            </div>
          </div>

          {/* Tabs Container */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Reviews ({reviews.length})
              </button>
              <button 
                className={`tab ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => setActiveTab('new')}
              >
                New ({newReviews.length})
              </button>
              <button 
                className={`tab ${activeTab === 'moderated' ? 'active' : ''}`}
                onClick={() => setActiveTab('moderated')}
              >
                Moderated ({moderatedReviews.length})
              </button>
              <button 
                className={`tab ${activeTab === 'positive' ? 'active' : ''}`}
                onClick={() => setActiveTab('positive')}
              >
                Positive ({positiveReviews.length})
              </button>
              <button 
                className={`tab ${activeTab === 'negative' ? 'active' : ''}`}
                onClick={() => setActiveTab('negative')}
              >
                Negative ({negativeReviews.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'all' && renderReviewCards(reviews)}
              {activeTab === 'new' && renderReviewCards(newReviews)}
              {activeTab === 'moderated' && renderReviewCards(moderatedReviews)}
              {activeTab === 'positive' && renderReviewCards(positiveReviews)}
              {activeTab === 'negative' && renderReviewCards(negativeReviews)}
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            className="refresh-button"
            onClick={fetchReviews}
            title="Refresh Reviews"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllReviews;
