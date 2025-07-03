import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification/Notification';
import "./Register.css";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Animation effect on component mount
  useEffect(() => {
    setLoaded(true);
    
    // Add scroll listener for parallax effects
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        sessionStorage.setItem('firstName', json.firstName || '');
        sessionStorage.setItem('lastName', json.lastName || '');
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
    <>
      {/* Navigation Bar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand" onClick={() => navigate('/')}>
          ElectronicsRetail™
        </div>
        <div className="nav-links">
          <div className="nav-link" onClick={() => navigate('/shop')}>Shop</div>
          <div className="nav-link" onClick={() => navigate('/about')}>About</div>
          <div className="nav-link nav-button" onClick={() => navigate('/login')}>Login</div>
        </div>
      </nav>
      
      <div className={`auth-container ${loaded ? 'loaded' : ''}`}>
        <div className="auth-content register-content">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Join ElectronicsRetail™ to shop, review products, and access support</p>
          </div>
          
          <div className="auth-form-container register-form-container">
            <h2 className="form-title">Registration Form</h2>
            <form onSubmit={register} className="auth-form register-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    placeholder="Enter your first name"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    placeholder="Enter your last name"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  placeholder="Enter your email address"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={userName}
                  placeholder="Choose a username"
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  placeholder="Create a password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </form>
            
            <div className="form-footer">
              <p>Already have an account? <span className="form-link" onClick={() => navigate('/login')}>Login here</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
