import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    
    // Check if user is authenticated
    if (!username) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const username = sessionStorage.getItem('username');
  
  // If not authenticated, don't render children
  if (!username) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
