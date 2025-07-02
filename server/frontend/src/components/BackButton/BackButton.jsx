import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ 
  to, 
  label = "← Back", 
  variant = "default",
  style = {}
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in history
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`back-button back-button-${variant}`}
      style={style}
    >
      {label}
    </button>
  );
};

export default BackButton;
