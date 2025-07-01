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
      console.log(`Order lookup for support ticket, transaction_id ${transaction_id}:`, orderData);
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

    console.log("Submitting support ticket for order:", order.id);
    const res = await fetch("http://localhost:8000/djangoapp/api/support", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    console.log("Support ticket submission result:", result);
    if (result.status === 200) {
      alert("Support ticket submitted!");
      navigate("/customer/orders");
    } else {
      alert("Failed to submit ticket: " + (result.message || result.error || "Unknown error"));
    }
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h2>🎧 Support Claim</h2>
        {order && <h3>Product: {order.product_name}</h3>}
      <div>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe the issue..."
          rows={5}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label>Attach a file (optional): </label>
        <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
      </div>
      <button onClick={submitSupportTicket} style={{ marginTop: "15px" }}>
        Submit Claim
      </button>
      </div>
    </div>
  );
};

export default SupportClaim;
