import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResetPasswordPage.css';
import resetIllustration from '../assets/reset-illustration.png';
import { forgotPassword, resetPassword } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email first.'); return; }
    const data = await forgotPassword(email);
    setMessage(data.message || 'Code sent!');
    setError('');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const data = await resetPassword(email, code, newPassword);
    if (data.message) {
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.error || 'Reset failed.');
    }
  };

  return (
    <div className="reset-container">
      <div className="background-curves-right">
        <div className="ellipse ellipse-light"></div>
        <div className="ellipse ellipse-medium"></div>
        <div className="ellipse ellipse-dark"></div>
      </div>

      <div className="reset-left">
        <div className="form-wrapper">
          <h1 className="reset-title">RESET PASSWORD</h1>

          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          <div className="form-content">
            <label className="input-label">Email</label>
            <div className="input-wrapper with-shadow">
              <span className="material-icons input-icon">person_outline</span>
              <input type="email" className="custom-input" placeholder="Enter your email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <label className="input-label">Code</label>
            <div className="code-row">
              <div className="code-input-wrapper">
                <span className="material-icons input-icon">qr_code_scanner</span>
                <input type="text" className="custom-input" placeholder="Enter code"
                  value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <button className="send-code-btn" onClick={handleSendCode}>Send code</button>
            </div>

            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input type="password" className="custom-input" placeholder="New Password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input type="password" className="custom-input" placeholder="Confirm Password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="reset-btn-container">
              <button className="reset-btn" onClick={handleReset}>
                <span className="reset-btn-text">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reset-right">
        <img src={resetIllustration} alt="Reset Illustration" className="illustration-img" />
      </div>
    </div>
  );
};

export default ResetPassword;