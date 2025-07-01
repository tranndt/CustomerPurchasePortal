import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const ProductReview = () => {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    // Optional: fetch product details if you want to show it
    const fetchProduct = async () => {
      const response = await fetch(`/api/product/${product_id}`);
      const data = await response.json();
      if (data.status === 200) setProduct(data.product);
    };
    fetchProduct();
  }, [product_id]);

  const submitReview = async () => {
    const response = await fetch("http://localhost:8000/djangoapp/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_id,
        review: reviewText,
        rating,
      }),
    });

    const result = await response.json();
    if (result.status === 200) {
      alert("Review submitted!");
      navigate("/orders");
    } else {
      alert("Failed to submit review.");
    }
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h2>⭐ Leave a Review</h2>
      {product && <h3>Product: {product.name}</h3>}
      <div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review"
          rows={5}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label>Rating: </label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Star{r > 1 && "s"}</option>
          ))}
        </select>
      </div>
      <button style={{ marginTop: "15px" }} onClick={submitReview}>Submit Review</button>
      </div>
    </div>
  );
};

export default ProductReview;
