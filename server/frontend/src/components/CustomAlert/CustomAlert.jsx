import React, { useState, useEffect } from 'react';
import './CustomAlert.css';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  title = 'Notification', 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onConfirm = () => {},
  inputPlaceholder = '',
  showInput = false,
  isInputRequired = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition time
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (showInput && isInputRequired && !inputValue.trim()) {
      // If input is required but empty, don't proceed
      return;
    }
    onConfirm(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    onClose();
    setInputValue('');
  };

  if (!isVisible) return null;

  return (
    <div className={`custom-alert-overlay ${isOpen ? 'open' : ''}`} onClick={handleCancel}>
      <div 
        className={`custom-alert-container ${type} ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the alert
      >
        <div className="custom-alert-header">
          <h3 className="custom-alert-title">{title}</h3>
          <button className="custom-alert-close" onClick={handleCancel}>×</button>
        </div>

        <div className="custom-alert-content">
          <div className="custom-alert-icon">
            {type === 'info' && <span>ℹ️</span>}
            {type === 'success' && <span>✅</span>}
            {type === 'warning' && <span>⚠️</span>}
            {type === 'error' && <span>❌</span>}
          </div>
          <p className="custom-alert-message">{message}</p>
          
          {showInput && (
            <input
              type="text"
              className="custom-alert-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
            />
          )}
        </div>

        <div className="custom-alert-actions">
          {showCancel && (
            <button 
              className="custom-alert-button cancel" 
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`custom-alert-button confirm ${type}`} 
            onClick={handleConfirm}
            disabled={showInput && isInputRequired && !inputValue.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
