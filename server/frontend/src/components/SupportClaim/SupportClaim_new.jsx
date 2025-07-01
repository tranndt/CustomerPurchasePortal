import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const SupportClaim = () => {
  const { transaction_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    // Fetch order by transaction_id to get order details
    const fetchOrder = async () => {
      const orderRes = await fetch(`http://localhost:8000/djangoapp/api/order-by-transaction/${transaction_id}`, {
        credentials: "include"
      });
      const orderData = await orderRes.json();
      if (orderData.status === 200 && orderData.order) {
        setOrder(orderData.order);
      }
    };
    fetchOrder();
  }, [transaction_id]);

  const submitSupportTicket = async () => {
    if (!order) {
      alert("Order information not found.");
      return;
    }
    
    const formData = new FormData();
    formData.append("order_id", order.id);
    formData.append("product_id", order.product_id);
    formData.append("issue_description", issueDescription);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const res = await fetch("http://localhost:8000/djangoapp/api/customer/support/new", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("Support ticket submitted!");
      navigate("/customer/orders");
    } else {
      alert("Failed to submit support ticket: " + (result.message || result.error || "Unknown error"));
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
              🎫 Submit Support Ticket
            </h1>
            <p style={{ 
              color: "#6c757d", 
              fontSize: "16px", 
              margin: "0",
              fontWeight: "400"
            }}>
              Get help with your order or product issue
            </p>
          </div>

          {order ? (
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
                <h3 style={{ margin: "0 0 16px 0", color: "#2c3e50" }}>Order Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "4px" }}>Product:</span>
                    <span style={{ color: "#2c3e50" }}>{order.product_name}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "4px" }}>Category:</span>
                    <span style={{ color: "#6c757d" }}>{order.category}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "4px" }}>Price:</span>
                    <span style={{ color: "#28a745", fontWeight: "600" }}>${order.price}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "4px" }}>Transaction ID:</span>
                    <span style={{ color: "#6c757d", fontFamily: "monospace", fontSize: "14px" }}>{transaction_id}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#495057", display: "block", marginBottom: "4px" }}>Purchase Date:</span>
                    <span style={{ color: "#6c757d" }}>{new Date(order.date_purchased).toLocaleDateString()}</span>
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
                  Issue Description: *
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Please describe the issue you're experiencing with this product or order..."
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
                  required
                />
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontWeight: "600", 
                  color: "#495057",
                  fontSize: "16px"
                }}>
                  Attachment (optional):
                </label>
                <div style={{
                  border: "2px dashed #e9ecef",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  transition: "border-color 0.2s ease"
                }}>
                  <input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "none",
                      backgroundColor: "transparent",
                      fontSize: "14px"
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <p style={{ 
                    margin: "8px 0 0 0", 
                    color: "#6c757d", 
                    fontSize: "12px" 
                  }}>
                    Supported formats: Images (JPG, PNG), PDF, Word documents
                  </p>
                  {attachment && (
                    <p style={{ 
                      margin: "8px 0 0 0", 
                      color: "#28a745", 
                      fontSize: "14px",
                      fontWeight: "600"
                    }}>
                      📎 {attachment.name}
                    </p>
                  )}
                </div>
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
                  onClick={submitSupportTicket}
                  disabled={!issueDescription.trim()}
                  style={{
                    background: issueDescription.trim() ? 
                      "linear-gradient(135deg, #28a745 0%, #20c997 100%)" : 
                      "#e9ecef",
                    color: issueDescription.trim() ? "white" : "#6c757d",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    cursor: issueDescription.trim() ? "pointer" : "not-allowed",
                    fontWeight: "600",
                    fontSize: "14px",
                    boxShadow: issueDescription.trim() ? 
                      "0 2px 4px rgba(40, 167, 69, 0.3)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (issueDescription.trim()) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (issueDescription.trim()) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 4px rgba(40, 167, 69, 0.3)";
                    }
                  }}
                >
                  Submit Support Ticket
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
              <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>Loading order information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportClaim;
