import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";
import BackButton from "../BackButton/BackButton";
import { showNotification } from '../Notification/Notification';
import API_URLS from '../../services/apiConfig';

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
      const orderRes = await fetch(`${API_URLS.BASE_URL}/djangoapp/api/order-by-transaction/${transaction_id}`, {
        credentials: "include"
      });
      const orderData = await orderRes.json();
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
      showNotification("Product not found for this order.", 'error');
      return;
    }
    const response = await fetch(`${API_URLS.BASE_URL}/djangoapp/api/customer/review`, {
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
    if (result.status === 200) {
      showNotification("Review submitted!", 'success');
      navigate("/customer/orders");
    } else {
      showNotification("Failed to submit review: " + (result.message || result.error || "Unknown error"), 'error');
    }
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ 
        padding: "24px", 
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}>
        <div style={{ 
          maxWidth: "800px", 
          margin: "0 auto"
        }}>
          <BackButton to="/customer/orders" label="← Back to My Orders" variant="primary" />
          
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
              ⭐ Write a Product Review
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Share your experience with this product
            </p>
          </div>

          {product ? (
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              border: "1px solid #e9ecef"
            }}>
              <div style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "32px",
                border: "1px solid #e9ecef"
              }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>{product.name}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057" }}>Category: </span>
                    <span style={{ color: "#6c757d" }}>{product.category}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057" }}>Price: </span>
                    <span style={{ color: "#28a745", fontWeight: "600" }}>${product.price}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057" }}>Transaction: </span>
                    <span style={{ color: "#6c757d", fontFamily: "monospace", fontSize: "14px" }}>{transaction_id}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontWeight: "600", 
                  color: "#495057",
                  fontSize: "16px"
                }}>
                  Rating:
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "28px",
                          cursor: "pointer",
                          color: star <= rating ? "#ffc107" : "#e9ecef",
                          transition: "color 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span style={{ 
                    marginLeft: "8px", 
                    color: "#6c757d", 
                    fontWeight: "600",
                    fontSize: "16px"
                  }}>
                    {rating} / 5
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontWeight: "600", 
                  color: "#495057",
                  fontSize: "16px"
                }}>
                  Review:
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "16px",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    resize: "vertical",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => navigate("/customer/orders")}
                  style={{
                    background: "transparent",
                    color: "#6c757d",
                    border: "2px solid #e9ecef",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#6c757d";
                    e.target.style.color = "#495057";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#e9ecef";
                    e.target.style.color = "#6c757d";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  Submit Review
                </button>
              </div>
            </div>
          ) : (
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
              <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading product information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReview;
