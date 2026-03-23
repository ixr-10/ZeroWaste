import React from 'react';
import '../styles/ResetPasswordPage.css';


import resetIllustration from '../assets/reset-illustration.png';

const ResetPassword = () => {

  
  // ADDED: Functions for the buttons
  
  const handleSendCode = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    alert("Verification code has been sent to your email!");
  };

  const handleReset = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    alert("Your password has been reset successfully!");
  };

  return (
    <div className="reset-container">
      
      {/* --- Curves  --- */}
      <div className="background-curves-right">
        <div className="ellipse ellipse-light"></div>
        <div className="ellipse ellipse-medium"></div>
        <div className="ellipse ellipse-dark"></div>
      </div>

      {/* --- Left Side: --- */}
      <div className="reset-left">
        <div className="form-wrapper">
          <h1 className="reset-title">RESET PASSWORD</h1>

          <div className="form-content">
            {/* Email */}
            <label className="input-label">Email</label>
            <div className="input-wrapper with-shadow">
              <span className="material-icons input-icon">person_outline</span>
              <input type="email" className="custom-input" placeholder="Enter your email" />
            </div>

            {/* Code */}
            <label className="input-label">Code</label>
            <div className="code-row">
              <div className="code-input-wrapper">
                <span className="material-icons input-icon">qr_code_scanner</span>
                <input type="text" className="custom-input" placeholder="Enter code" />
              </div>
              {/* Added onClick to the button */}
              <button className="send-code-btn" onClick={handleSendCode}>
                Send code
              </button>
            </div>

            {/* Password */}
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input type="password" className="custom-input" placeholder="New Password" />
              <span className="material-icons input-icon-right">visibility_off</span>
            </div>

            {/* Confirm Password */}
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input type="password" className="custom-input" placeholder="Confirm Password" />
              <span className="material-icons input-icon-right">visibility_off</span>
            </div>

            {/* Reset Button */}
            <div className="reset-btn-container">
              {/*  Added onClick to the button */}
              <button className="reset-btn" onClick={handleReset}>
                <span className="reset-btn-text">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Illustration Fo9 l-curves --- */}
      <div className="reset-right">
        <img 
          src={resetIllustration} 
          alt="Reset Illustration" 
          className="illustration-img" 
        />
      </div>

    </div>
  );
};

export default ResetPassword;