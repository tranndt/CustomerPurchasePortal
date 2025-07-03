import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification/Notification';
import BackButton from '../BackButton/BackButton';

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  let login_url = "http://localhost:8000/djangoapp/login";
  let demo_users_url = "http://localhost:8000/djangoapp/api/demo-users";

  // Fetch demo users on component mount
  useEffect(() => {
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
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <BackButton />
      
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🛍️ ElectronicsRetail™</h1>
        <p>Access your orders, reviews, and support tickets</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        alignItems: 'start' 
      }}>
        {/* Login Form */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Login</h2>
          <form onSubmit={login}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username:</label>
              <input 
                type="text" 
                value={userName}
                placeholder="Enter your username" 
                onChange={(e) => setUserName(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
              <input 
                type="password" 
                value={password}
                placeholder="Enter your password" 
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  flex: 1
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  flex: 1
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <p>Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</a></p>
          </div>
        </div>

        {/* Demo Users Section */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>🚀 Demo Profiles</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Click on any profile to login instantly (demo purposes)</p>
          
          {demoUsers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demoUsers.map((user, index) => (
                <div 
                  key={index}
                  onClick={() => loginAsDemo(user.username)}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    padding: '15px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': {
                      backgroundColor: '#e9ecef'
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.username}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>@{user.username}</div>
                  <div style={{ 
                    color: user.role === 'Admin' ? '#dc3545' : '#28a745', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    marginTop: '5px'
                  }}>
                    {user.role || 'Customer'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p>Loading demo profiles...</p>
            </div>
          )}
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '14px' }}>
            <strong>Note:</strong> These are demo accounts. All demo users use the password: <code>password123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
