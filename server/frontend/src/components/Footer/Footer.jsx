import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>ElectronicsRetail™</h3>
          <p>Demo E-Commerce Platform</p>
          <p>Built with Django, React, and Express.js</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li onClick={() => navigate('/')}>Home</li>
            <li onClick={() => navigate('/shop')}>Shop</li>
            <li onClick={() => navigate('/about')}>About</li>
            <li onClick={() => navigate('/login')}>Login</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Demo Features</h4>
          <ul>
            <li>Product Catalog</li>
            <li>User Authentication</li>
            <li>Shopping Cart</li>
            <li>Order Management</li>
            <li>Admin Dashboard</li>
            <li>Customer Support</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Technology Stack</h4>
          <ul>
            <li>Django + REST API</li>
            <li>React + React Router</li>
            <li>Express.js + MongoDB</li>
            <li>SQLite Database</li>
            <li>Sentiment Analysis</li>
            <li>Deployed on Render</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-disclaimer">
          <p>
            <strong>Demo Website Notice:</strong> This is a demonstration e-commerce platform 
            built for educational and portfolio purposes. No real transactions are processed.
          </p>
        </div>
        
        <div className="footer-credits">
          <p>
            © {currentYear} Built by <strong>Jase Tran</strong> | 
            Full-Stack Developer Portfolio Project | 
            <span 
              className="footer-link" 
              onClick={() => navigate('/about')}
            >
              Learn More
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
