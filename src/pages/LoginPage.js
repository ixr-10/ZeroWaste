import React, { useState } from 'react';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { loginUser, getProfile } from '../services/api';

import illustration from '../assets/login-illustration.png';
import mailIcon from '../assets/mail.png';
import padlockIcon from '../assets/padlock.png';
import eyeIcon from '../assets/eye.png';

function LoginPage({ onNavigateToReset }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      const profile = await getProfile(data.access);

      if (profile.role !== 'admin') {
        setError('Access denied. This login is for admins only.');
        setLoading(false);
        return;
      }

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(profile));
      navigate('/admin/users'); // ← changed from /admin/dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="background-curves">
        <div className="ellipse ellipse-light"></div>
        <div className="ellipse ellipse-medium"></div>
        <div className="ellipse ellipse-dark"></div>
      </div>

      <div className="login-left">
        <img src={illustration} alt="User login illustration" className="illustration-img" />
      </div>

      <div className="login-right">
        <div className="form-container">
          <h1 className="login-title">LOGIN</h1>
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <img src={mailIcon} alt="Email icon" className="icon left-icon" />
              <input
                type="text"
                className="custom-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <img src={padlockIcon} alt="Padlock icon" className="icon left-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img
                src={eyeIcon}
                alt="Toggle visibility"
                className="icon right-icon clickable"
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>

          <div className="forgot-password-container">
            <a href="#!" className="forgot-password-link"
              onClick={(e) => { e.preventDefault(); onNavigateToReset(); }}>
              forgot password?
            </a>
          </div>

          <div className="button-container">
            <button className="login-button" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;