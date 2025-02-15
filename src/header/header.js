import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authcontext.js";
import "./header.css";
import NavBar from "./navbar";
import Toggle from "./toggle.js";

const Header = () => {
  const { isLoggedIn, userEmail, logout } = useAuth();

  return (
    <header>
      <Link to="/" className="header-link">
        <img src="/customquizzeslogo.png" alt="Custom Quizzes" />
      </Link>
      <div>
        <NavBar
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogout={logout}
        />
        <Toggle
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogout={logout}
        />
      </div>
    </header>
  );
};

export default Header;
