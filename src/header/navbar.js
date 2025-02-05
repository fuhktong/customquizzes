import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const NavBar = () => {
  return (
    <nav className="desktop-nav">
      <ul>
        <li>
          <Link to="/definitions">Definitions</Link>
        </li>
        <li>
          <div id="navbar-electoral-college">Quiz Template</div>
          <div className="dropdown-content">
            <Link to="/names">Names</Link>
            <Link to="/descriptions">Descriptions</Link>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
