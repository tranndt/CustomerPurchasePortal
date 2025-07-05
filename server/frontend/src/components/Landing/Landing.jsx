import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import './Landing.css';

const Landing = () => {
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
    
      {/* Welcome Section - Top 1/4 */}
      <div className={`welcome-section fade-in ${loaded ? 'active' : ''} `} 
           style={{ 
             height: '14vh',
             marginTop: '60px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             textAlign: 'center',
             background: 'linear-gradient(135deg, rgba(142, 72, 208, 0.95) 0%, rgba(38, 30, 186, 0.95) 100%)',
             color: '#fff',
             boxShadow: '0 4px 8px rgba(0, 0, 0, 0.84)',
           }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5em', 
            marginBottom: '5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Welcome to ElectronicsRetail™!
          </h1>
        </div>
      </div>

      <div className={`landing-container ${scrolled ? 'scrolled' : ''}`} style={{ height: 'calc(100vh - 60px - 8vh)', display: 'flex' }}>

        {/* Left: Branding with enhanced visual depth */}
        <div 
          className="branding-section"
          style={{
            width: '50%',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%), url("https://images.unsplash.com/photo-1581092921461-eab98e4fee3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80") center/cover no-repeat'
          }}
        >
          {/* Semi-transparent diagonal pattern overlay for depth */}
          <div className="diagonal-pattern"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>

          <div className="branding-content">
            <h1 className={`brand-headline fade-in delay-2 ${loaded ? 'active' : ''}`}>
              Your Stop for Great Tech. Smarter, Faster, Connected.
            </h1>
            <p className={`brand-description fade-in delay-3 ${loaded ? 'active' : ''}`}>
              From must-have gadgets to the latest smart home gear, we deliver the technology you need — fast, reliable, and right to your door.
            </p>
          
            {/* Shop Our Categories Section */}
            <div className={`product-categories fade-in delay-4 ${loaded ? 'active' : ''}`} onClick={() => navigate('/shop')}>
              <h3 className="categories-title">Shop Our Categories</h3>
              <div className="categories-grid">
                <div className="category">
                  <div className="category-icon">📱</div>
                  <div className="category-text">Smartphones</div>
                </div>
                <div className="category">
                  <div className="category-icon">💻</div>
                  <div className="category-text">Laptops</div>
                </div>
                <div className="category">
                  <div className="category-icon">🎧</div>
                  <div className="category-text">Audio</div>
                </div>
                <div className="category">
                  <div className="category-icon">📺</div>
                  <div className="category-text">Smart TVs</div>
                </div>
                <div className="category">
                  <div className="category-icon">⌚</div>
                  <div className="category-text">Wearables</div>
                </div>
                <div className="category">
                  <div className="category-icon">🎮</div>
                  <div className="category-text">Gaming</div>
                </div>
              </div>
              <div className="shop-now-overlay">
                <div className="shop-now-text">Browse All Products </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="action-section" style={{ width: '50%' }}>
          {/* Subtle background pattern for visual interest */}
          <div className="subtle-pattern"></div>

          <div className="action-content">
            <h2 className={`action-title fade-in delay-2 ${loaded ? 'active' : ''}`}>
              Access Your Account Portal
            </h2>
            <p className="block-description">
              Log in to our Customer or Employee Portal to make purchases, track delivery and manage orders. </p>
            {/* App Preview/Illustration with mockup frame */}
            <div className={`preview-container fade-in delay-3 ${loaded ? 'active' : ''}`}>
              <div className="browser-mockup">
                <div className="browser-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="browser-address">electronicsretail.app</div>
              </div>
              <div className="preview-image">
                <img 
                  src="customer-dashboard.png" 
                  alt="Electronics dashboard preview" 
                  sizes="(max-width: 400px) 50vw, 400px" 
                  style={{ maxWidth: '100%', height: 'auto', imageRendering: 'auto' }}
                />
              </div>
            </div>

            <div className="action-blocks">
              <div className={`action-block fade-in delay-4 ${loaded ? 'active' : ''}`} 
                   style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary scale-on-hover"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary scale-on-hover"
                >
                  Register
                </button>
              </div>
            </div>
          
            {/* Footer section */}
            <div className={`footer fade-in delay-6 ${loaded ? 'active' : ''}`}>
              <div>© 2025 ElectronicsRetail Inc. All rights reserved.</div>
              <div className="footer-links">
                <span className="footer-link" onClick={() => navigate('/about')}>About</span>
                <span className="footer-divider">•</span>
                <span className="footer-link">Privacy</span>
                <span className="footer-divider">•</span>
                <span className="footer-link">Terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Landing;
