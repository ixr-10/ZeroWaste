import React, { useState } from 'react';
import '../styles/SetPasswordPage.css'; 

import setPasswordIllustration from '../assets/set-password-illustration.png';

function SetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="set-password-container">
      
      {/*  CURVES  */}
      <div className="background-curves-right">
        <div className="sp-ellipse sp-ellipse-light"></div>
        <div className="sp-ellipse sp-ellipse-medium"></div>
        <div className="sp-ellipse sp-ellipse-dark"></div>
      </div>

      {/* Left Side: Form Section */}
      <div className="form-section">
        
        <h1 className="set-password-title">SET PASSWORD</h1>

        <form className="set-password-form">
          {/* Username */}
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">person_outline</span>
              <input type="text" className="custom-input" placeholder=" " />
            </div>
          </div>

          {/* Code */}
          <div className="input-group">
            <label className="input-label">Code</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">app_registration</span>
              <input type="text" className="custom-input" placeholder=" " />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input
                type={showPassword ? "text" : "password"}
                className="custom-input"
              />
              <span
                className="material-icons input-icon-right clickable"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="material-icons input-icon">lock_outline</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="custom-input"
              />
              <span
                className="material-icons input-icon-right clickable"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? "visibility" : "visibility_off"}
              </span>
            </div>
          </div>

          {/* Finish Button */}
          <div className="button-container">
            <button className="finish-button">Finish</button>
          </div>
        </form>
      </div>

      {/* Right Side: Info Section (Image & Text) */}
      <div className="info-section">
        <img
          src={setPasswordIllustration}
          alt="Isometric Admin Sign Up"
          className="illustration-img"
        />
        <p className="curved-shape-text">SET YOUR PASSWORD AS A NEW ADMIN</p>
      </div>
    </div>
  );
}

export default SetPasswordPage;