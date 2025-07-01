import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>);
  const [reviewText, setReviewText] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [purchase, setPurchase] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState("");

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("dealer"));
  let params = useParams();
  let id = params.id;
  let dealer_url = root_url + `djangoapp/get_dealer/${id}`;
  let reviews_url = root_url + `djangoapp/reviews/dealer/${id}`;
  let add_review_url = root_url + `djangoapp/add_review`;

  const get_dealer = useCallback(async () => {
    const res = await fetch(dealer_url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      setDealer(retobj.dealer);
    }
  }, [dealer_url]);

  const get_reviews = useCallback(async () => {
    const res = await fetch(reviews_url);
    const retobj = await res.json();
    if (retobj.status === 200) {
      if (retobj.reviews.length > 0) {
        setReviews(retobj.reviews);
      } else {
        setUnreviewed(true);
      }
    }
  }, [reviews_url]);

  const submitReview = useCallback(async () => {
    const username = sessionStorage.getItem("username");
    if (!username) {
      alert("Please login to submit a review");
      return;
    }

    // Validate required fields
    if (!reviewText.trim()) {
      alert("Please enter a review");
      return;
    }
    if (!carMake.trim() || !carModel.trim()) {
      alert("Please enter car make and model");
      return;
    }

    const payload = {
      name: username,
      review: reviewText.trim(),
      car_make: carMake.trim(),
      car_model: carModel.trim(),
      car_year: parseInt(carYear) || new Date().getFullYear(),
      purchase: purchase,
      purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
      dealership: parseInt(id)
    };

    try {
      const res = await fetch(add_review_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 200) {
        alert("Review submitted successfully! Sentiment analysis has been applied.");
        setReviewText("");
        setCarMake("");
        setCarModel("");
        setCarYear("");
        setPurchaseDate("");
        setPurchase(false);
        get_reviews(); // refresh reviews
      } else {
        alert("Error submitting review: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Network error occurred while submitting review");
      console.error("Submit review error:", error);
    }
  }, [reviewText, carMake, carModel, carYear, purchase, purchaseDate, id, add_review_url, get_reviews]);

  const senti_icon = (sentiment) => {
    return sentiment === "positive" ? positive_icon :
           sentiment === "negative" ? negative_icon :
           neutral_icon;
  }

  useEffect(() => {
    get_dealer();
    get_reviews();
  }, [get_dealer, get_reviews]);

  useEffect(() => {
    if (sessionStorage.getItem("username")) {
      setPostReview(
        <div className="review-form" style={{ marginTop: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>Add a Review</h3>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Review *</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review about this dealership..."
              required
              style={{ width: "100%", minHeight: "100px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Car Make *</label>
              <input
                type="text"
                value={carMake}
                onChange={(e) => setCarMake(e.target.value)}
                placeholder="e.g., Toyota"
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Car Model *</label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="e.g., Camry"
                required
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Car Year</label>
              <input
                type="number"
                value={carYear}
                onChange={(e) => setCarYear(e.target.value)}
                placeholder="e.g., 2023"
                min="1900"
                max={new Date().getFullYear() + 1}
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={purchase}
                onChange={() => setPurchase(!purchase)}
              />
              <span style={{ fontWeight: "bold" }}>Did you purchase a car from this dealership?</span>
            </label>
          </div>
          <button 
            onClick={submitReview} 
            style={{ 
              backgroundColor: "#007bff", 
              color: "white", 
              padding: "12px 24px", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              fontSize: "16px"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            Submit Review
          </button>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            * Required fields. Your review will be analyzed for sentiment automatically.
          </p>
        </div>
      );
    } else {
      setPostReview(<></>);
    }
  }, [reviewText, carMake, carModel, carYear, purchase, purchaseDate, submitReview]);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>{dealer.full_name}</h1>
        <h4 style={{ color: "grey" }}>
          {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>
        {postReview}
      </div>
      <div className="reviews_panel">
        {reviews.length === 0 && unreviewed === false ? (
          <text>Loading Reviews....</text>
        ) : unreviewed === true ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="review_panel" style={{ marginBottom: "15px", padding: "15px", border: "1px solid #eee", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment' style={{ marginRight: "10px" }} />
                <div style={{ fontSize: "12px", color: "#666", textTransform: "capitalize" }}>
                  {review.sentiment || "neutral"} sentiment
                </div>
              </div>
              <div className="review" style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "10px" }}>{review.review}</div>
              <div className="reviewer" style={{ fontSize: "14px", color: "#666" }}>
                <strong>{review.name}</strong> - {review.car_make} {review.car_model} {review.car_year}
                {review.purchase && <span style={{ marginLeft: "10px", color: "#28a745" }}>✓ Purchased</span>}
                {review.purchase_date && <span style={{ marginLeft: "10px" }}>on {review.purchase_date}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dealer;
