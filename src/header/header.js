import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./header.css";
import NavBar from "./navbar";
import Toggle from "./toggle.js";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userEmail");
    if (loggedInUser) {
      setIsLoggedIn(true);
      setUserEmail(loggedInUser);
    }
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.reload();
  };

  return (
    <header>
      <Link to="/" className="header-link">
        <img src="/customquizzeslogo.png" alt="Custom Quizzes" />
      </Link>
      <div>
        <NavBar
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
        <Toggle
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
