// HamburgerMenu.js
import React from "react";
import { Link } from "react-router-dom";
import "./toggle.css";

const Toggle = ({ isOpen, toggleMenu }) => {
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
        <ul>
          <li>
            <Link to="/definitions" onClick={toggleMenu}>
              DEFINITIONS
            </Link>
          </li>
          <li>
            <Link to="/descriptions" onClick={toggleMenu}>
              DESCRIPTIONS
            </Link>
          </li>
          <li>
            <Link to="/names" onClick={toggleMenu}>
              NAMES
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Toggle;
