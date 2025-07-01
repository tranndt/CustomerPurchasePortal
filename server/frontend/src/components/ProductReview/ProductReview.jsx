import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const ProductReview = () => {
  const { transaction_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    // Fetch order by transaction_id to get product_id
    const fetchOrderAndProduct = async () => {
      const orderRes = await fetch(`http://localhost:8000/djangoapp/api/order-by-transaction/${transaction_id}`, {
        credentials: "include"
      });
      const orderData = await orderRes.json();
      console.log(`Order lookup for transaction_id ${transaction_id}:`, orderData);
      if (orderData.status === 200 && orderData.order) {
        setProductId(orderData.order.product_id);
        // We already have product info from the order, so we can set it directly
        setProduct({
          name: orderData.order.product_name,
          category: orderData.order.category,
          price: orderData.order.price
        });
      }
    };
    fetchOrderAndProduct();
  }, [transaction_id]);

  const submitReview = async () => {
    if (!productId) {
      alert("Product not found for this order.");
      return;
    }
    console.log("Submitting review with productId:", productId);
    const response = await fetch("http://localhost:8000/djangoapp/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_id: productId,
        review: reviewText,
        rating,
      }),
    });

    const result = await response.json();
    console.log("Review submission result:", result);
    if (result.status === 200) {
      alert("Review submitted!");
      navigate("/customer/orders");
    } else {
      alert("Failed to submit review: " + (result.message || result.error || "Unknown error"));
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
