import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimpleNav from "../SimpleNav/SimpleNav";

const SupportClaim = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    // Optional: fetch order details
    const fetchOrder = async () => {
      const res = await fetch(`http://localhost:8000/djangoapp/api/myorders`);
      const data = await res.json();
      if (data.status === 200) {
        const match = data.orders.find(o => o.order_id.toString() === order_id);
        if (match) setOrder(match);
      }
    };
    fetchOrder();
  }, [order_id]);

  const submitSupportTicket = async () => {
    const formData = new FormData();
    formData.append("order_id", order_id);
    formData.append("product_id", order?.product_id);
    formData.append("issue_description", issueDescription);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const res = await fetch("http://localhost:8000/djangoapp/api/support", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("Support ticket submitted!");
      navigate("/orders");
    } else {
      alert("Failed to submit ticket.");
    }
  };

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h2>🎧 Support Claim</h2>
      {order && <h3>Product: {order.product}</h3>}
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
