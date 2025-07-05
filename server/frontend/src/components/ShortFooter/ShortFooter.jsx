import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ShortFooter.css';

const ShortFooter = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="short-footer">
      <div className="short-footer-content">
        <div className="short-footer-disclaimer">
          <p>
            <strong>Demo Website Notice:</strong> This is a demonstration e-commerce platform 
            built for educational and portfolio purposes. No real transactions are processed.
          </p>
        </div>
        
        <div className="short-footer-credits">
          <p>
            © {currentYear} Built by <strong>Jase Tran</strong> | 
            Full-Stack Developer Portfolio Project | 
            <span 
              className="short-footer-link" 
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

export default ShortFooter;
