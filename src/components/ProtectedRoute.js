import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.role) {
      navigate('/login', { replace: true });
      return;
    }

    // If allowedRoles is specified, check it
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'localauthority') {
        navigate('/authority/statistics', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    setVerified(true);
  }, [navigate]);

  return verified ? children : null;
}

export default ProtectedRoute;