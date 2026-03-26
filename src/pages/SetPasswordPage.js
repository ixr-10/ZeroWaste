import React, { useState } from 'react';
import '../styles/SetPasswordPage.css';
import { useNavigate } from 'react-router-dom';
import { setPassword } from '../services/api';

import setPasswordIllustration from '../assets/set-password-illustration.png';

function SetPasswordPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword_] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const data = await setPassword(username, code, password, confirmPassword);
    setLoading(false);

    if (data.message) {
      setSuccess(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } else {
      setError(data.error || 'Something went wrong.');
    }
  };

  return (
    <div className="set-password-container">
      <div className="background-curves-right">
        <div className="sp-ellipse sp-ellipse-light"></div>
        <div className="sp-ellipse sp-ellipse-medium"></div>
        <div className="sp-ellipse sp-ellipse-dark"></div>
      </div>

      <div className="form-section">
        <h1 className="set-password-title">SET PASSWORD</h1>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success} Redirecting to login...</p>}

        <form className="set-password-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">person_outline</span>
              <input
                type="text"
                className="custom-input"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Code</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">app_registration</span>
              <input
                type="text"
                className="custom-input"
                placeholder=" "
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="custom-input"
                value={password}
                onChange={(e) => setPassword_(e.target.value)}
              />
              <span
                className="material-icons input-icon-right clickable"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="custom-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="material-icons input-icon-right clickable"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>
          </div>

          <div className="button-container">
            <button className="finish-button" type="submit" disabled={loading}>
              {loading ? 'Setting...' : 'Finish'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-section">
        <img src={setPasswordIllustration} alt="Isometric Admin Sign Up" className="illustration-img" />
        <p className="curved-shape-text">SET YOUR PASSWORD AS A NEW ADMIN</p>
      </div>
    </div>
  );
}

export default SetPasswordPage;