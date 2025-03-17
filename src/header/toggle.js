import React from "react";
import { Link } from "react-router-dom";
import "./toggle.css";

const Toggle = ({ isOpen, toggleMenu, isLoggedIn, userEmail, onLogout }) => {
  const handleLogout = () => {
    onLogout();
    window.location.href = "/";
  };
  return (
    <div className="mobile-nav">
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-content">
          <Link
            to="/quiz-maker"
            onClick={toggleMenu}
            className="mobile-heading"
          >
            Quiz Maker
          </Link>

          <hr className="mobile-divider" />

          <p className="mobile-heading">Fallacy Quiz</p>
          <Link to="/landing-names" onClick={toggleMenu}>
            Names
          </Link>
          <Link to="/landing-descriptions" onClick={toggleMenu}>
            Descriptions
          </Link>
          <Link to="/definitions" onClick={toggleMenu}>
            Definitions
          </Link>

          <hr className="mobile-divider" />

          {isLoggedIn ? (
            <>
              <p>{userEmail}</p>
              <Link to="/my-quizzes" onClick={toggleMenu}>
                My Quizzes
              </Link>
              <Link to="/settings" onClick={toggleMenu}>
                Settings
              </Link>
              <button onClick={handleLogout} className="mobile-link">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={toggleMenu} className="mobile-heading">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toggle;
