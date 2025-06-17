import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="header-container">
        <Link to="/" className="logo-link">
          <img
            src="/images/racingLogo.png"
            alt="Racing de Santander Crest"
            className="logo"
          />
        </Link>

        <nav className={`main-nav ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
                onClick={closeMenu}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                to="/squad"
                className={location.pathname === "/squad" ? "active" : ""}
                onClick={closeMenu}
              >
                SQUAD
              </Link>
            </li>
            <li>
              <Link
                to="/history"
                className={location.pathname === "/history" ? "active" : ""}
                onClick={closeMenu}
              >
                HISTORY
              </Link>
            </li>
          </ul>
        </nav>

        <a
          href="https://entradas.realracingclub.es/"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
        >
          BUY TICKETS
        </a>

        <button
          className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
          aria-label="Open navigation menu"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
