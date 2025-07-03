import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification/Notification';
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  let login_url = "http://localhost:8000/djangoapp/login";
  let demo_users_url = "http://localhost:8000/djangoapp/api/demo-users";

  // Animation effect on component mount and fetch demo users
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
    
    // Fetch demo users
    const fetchDemoUsers = async () => {
      console.log("Attempting to fetch demo users from:", demo_users_url);
      try {
        const res = await fetch(demo_users_url, {
          method: "GET",
          credentials: "include",
        });
        console.log("Response status:", res.status);
        const json = await res.json();
        console.log("Response data:", json);
        if (json.status === 200) {
          setDemoUsers(json.users || []);
        } else {
          console.log("API returned non-200 status, using fallback users");
          // Fallback to default demo users if API fails
          setDemoUsers([
            {
              username: 'demo_customer',
              first_name: 'Demo',
              last_name: 'Customer',
              role: 'Customer'
            },
            {
              username: 'demo_admin',
              first_name: 'Demo',
              last_name: 'Admin',
              role: 'Admin'
            },
            {
              username: 'demo_support',
              first_name: 'Demo',
              last_name: 'Support',
              role: 'Support'
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch demo users:", error);
        console.log("Using fallback demo users due to fetch error");
        // Fallback to default demo users if fetch fails
        setDemoUsers([
          {
            username: 'demo_customer',
            first_name: 'Demo',
            last_name: 'Customer',
            role: 'Customer'
          },
          {
            username: 'demo_admin',
            first_name: 'Demo',
            last_name: 'Admin',
            role: 'Admin'
          },
          {
            username: 'demo_support',
            first_name: 'Demo',
            last_name: 'Support',
            role: 'Support'
          }
        ]);
      }
    };

    fetchDemoUsers();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [demo_users_url]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(login_url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
              "userName": userName,
              "password": password
          }),
      });
      
      const json = await res.json();
      if (json.status != null && json.status === 200) {
          sessionStorage.setItem('username', json.userName);
          sessionStorage.setItem('firstName', json.firstName || '');
          sessionStorage.setItem('lastName', json.lastName || '');
          sessionStorage.setItem('userRole', json.userRole || 'Customer');
          
          // Redirect to role-specific home page
          const userRole = json.userRole || 'Customer';
          if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
            navigate("/admin/home");
          } else if (userRole.toLowerCase() === 'support') {
            navigate("/support/home");
          } else {
            navigate("/customer/home");
          }        
      }
      else {
        showNotification("The user could not be authenticated.", 'error');
      }
    } catch (error) {
      showNotification("Login failed. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (username) => {
    setLoading(true);
    try {
      // For demo purposes, we'll use a default password
      const res = await fetch(login_url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
              "userName": username,
              "password": "password123" // Default demo password
          }),
      });
      
      const json = await res.json();
      if (json.status != null && json.status === 200) {
          sessionStorage.setItem('username', json.userName);
          sessionStorage.setItem('firstName', json.firstName || '');
          sessionStorage.setItem('lastName', json.lastName || '');
          sessionStorage.setItem('userRole', json.userRole || 'Customer');
          
          // Redirect to role-specific home page
          const userRole = json.userRole || 'Customer';
          if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager') {
            navigate("/admin/home");
          } else if (userRole.toLowerCase() === 'support') {
            navigate("/support/home");
          } else {
            navigate("/customer/home");
          }        
      }
      else {
        showNotification("Demo login failed. This user may not have the default password.", 'error');
      }
    } catch (error) {
      showNotification("Demo login failed. Please try manual login.", 'error');
    } finally {
      setLoading(false);
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
          <div className="nav-link nav-button" onClick={() => navigate('/register')}>Register</div>
        </div>
      </nav>
      
      <div className={`auth-container ${loaded ? 'loaded' : ''}`}>
        <div className="auth-content">
          <div className="auth-header">
            <h1 className="auth-title">Sign In to Your Account</h1>
            <p className="auth-subtitle">Access your orders, reviews, and manage your electronics</p>
          </div>
          
          <div className="auth-grid">
            {/* Login Form */}
            <div className="auth-form-container">
              <h2 className="form-title">Login</h2>
              <form onSubmit={login} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={userName}
                    placeholder="Enter your username" 
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
                    placeholder="Enter your password" 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              
              <div className="form-footer">
                <p>Don't have an account? <span className="form-link" onClick={() => navigate('/register')}>Register here</span></p>
              </div>
            </div>

            {/* Demo Users Section */}
            <div className="auth-demo-container">
              <h2 className="demo-title">Demo Profiles</h2>
              <p className="demo-subtitle">Click any profile to login instantly</p>
              
              {demoUsers.length > 0 ? (
                <div className="demo-profiles-grid">
                  {demoUsers.map((user, index) => (
                    <div 
                      key={index}
                      onClick={() => loginAsDemo(user.username)}
                      className="demo-profile-card"
                    >
                      {/* Role Badge */}
                      <div className={`role-badge role-${user.role?.toLowerCase() || 'customer'}`}>
                        {user.role || 'Customer'}
                      </div>
                      
                      <div className="profile-name">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username}
                      </div>
                      <div className="profile-username">@{user.username}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="demo-loading">
                  <p>Loading demo profiles...</p>
                </div>
              )}
              
              <div className="demo-note">
                <strong>Note:</strong> These are demo accounts. All demo users use the password: <code>password123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
