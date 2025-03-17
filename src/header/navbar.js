import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const NavBar = ({ isLoggedIn, userEmail, onLogout }) => {
  const handleLogout = () => {
    onLogout();
    window.location.href = "/";
  };
  return (
    <nav className="desktop-nav">
      <ul>
        <li>
          <Link to="/quiz-maker">Quiz Maker</Link>
        </li>
        <li>
          <div className="fallacy-dropdown">
            <button className="nav-login-button">Fallacy Quiz</button>
            <div className="account-dropdown-content">
              <Link to="/landing-names">Names</Link>
              <Link to="/landing-descriptions">Descriptions</Link>
              <Link to="/definitions">Definitions</Link>
            </div>
          </div>
        </li>
        <li>
          {isLoggedIn ? (
            <div className="account-dropdown">
              <button className="nav-login-button">{userEmail}</button>
              <div className="account-dropdown-content">
                <Link to="/my-quizzes">My Quizzes</Link>
                <Link to="/settings">Settings</Link>
                <button onClick={handleLogout} className="dropdown-logout">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-login-button">
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
