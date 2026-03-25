import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Verify token is still valid with the backend
    getProfile(token)
      .then((profile) => {
        if (profile.role !== 'admin') {
          localStorage.clear();
          navigate('/login', { replace: true });
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        localStorage.clear();
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  return verified ? children : null;
}

export default ProtectedRoute;