import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification/Notification';
import BackButton from '../BackButton/BackButton';
import "./Register.css";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();

    if (!userName || !password || !firstName || !lastName || !email) {
      showNotification("All fields are required", 'warning');
      return;
    }

    const register_url = "http://localhost:8000/djangoapp/register";

    try {
      const res = await fetch(register_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userName: userName,
          password: password,
          firstName: firstName,
          lastName: lastName,
          email: email
        }),
      });

      const json = await res.json();
      
      if (json.status === 201) {
        sessionStorage.setItem('username', json.userName);
        sessionStorage.setItem('userRole', json.userRole || 'Customer');
        showNotification("Registration successful! You are now logged in.", 'success');
        
        // Redirect to role-specific home page
        const userRole = json.userRole || 'Customer';
        if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
          navigate("/admin/home");
        } else if (userRole.toLowerCase() === 'support') {
          navigate("/support/home");
        } else {
          navigate("/customer/home");
        }
      } else if (json.status === 409) {
        showNotification("User already exists. Please choose a different username.", 'error');
      } else {
        showNotification("Registration failed: " + (json.message || "Unknown error"), 'error');
      }
    } catch (error) {
      console.error("Registration error:", error);
      showNotification("Registration failed. Please try again.", 'error');
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <BackButton />
      
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🔐 Register for ElectronicsRetail</h1>
        <p>Create your account to access orders, reviews, and support</p>
      </header>
      
      <div style={{ backgroundColor: "#f8f9fa", padding: "30px", borderRadius: "8px" }}>
        <form onSubmit={register}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Username:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                flex: 1
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
        
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
