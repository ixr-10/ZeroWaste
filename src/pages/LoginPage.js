import React, { useState } from 'react';
import '../styles/LoginPage.css';

import illustration from '../assets/login-illustration.png';
import mailIcon from '../assets/mail.png';
import padlockIcon from '../assets/padlock.png';
import eyeIcon from '../assets/eye.png';

// the onNavigateToReset  is here as a prop to be received from App.js
function LoginPage({ onNavigateToReset }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {/* Absolute Background Curves*/}
      <div className="background-curves">
        <div className="ellipse ellipse-light"></div>
        <div className="ellipse ellipse-medium"></div>
        <div className="ellipse ellipse-dark"></div>
      </div>

      {/* Left Side: Illustration */}
      <div className="login-left">
        <img
          src={illustration}
          alt="User login illustration"
          className="illustration-img" 
        />
      </div>

      {/* Right Side: Form */}
      <div className="login-right">
        <div className="form-container">
          <h1 className="login-title">LOGIN</h1>

          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <img src={mailIcon} alt="Email icon" className="icon left-icon" />
              <input
                type="email"
                className="custom-input"
                placeholder=" " 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <img src={padlockIcon} alt="Padlock icon" className="icon left-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="custom-input" 
              />
              <img
                src={eyeIcon}
                alt="Toggle visibility"
                className="icon right-icon clickable"
                onClick={togglePasswordVisibility} 
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password-container">
            {/* Trigger the function on click to navigate to the Reset page */}
            <a 
              href="#!" 
              className="forgot-password-link" 
              onClick={(e) => {
                e.preventDefault();  
                onNavigateToReset();
              }}
            >
              forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button className="login-button">Login</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;