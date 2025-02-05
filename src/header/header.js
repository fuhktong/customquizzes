import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./header.css";
import NavBar from "./navbar";
import Toggle from "./toggle.js";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <Link to="/" className="header-link">
        <img src="/logicalfallacyhomepic3.png" alt="Logical Fallacy Quiz" />
        <div className="header-title">
          <p>Logical</p>
          <p>Fallacy</p>
          <p>Quiz</p>
        </div>
      </Link>
      <div>
        <NavBar />
        <Toggle isOpen={menuOpen} toggleMenu={toggleMenu} />
      </div>
    </header>
  );
};

export default Header;
