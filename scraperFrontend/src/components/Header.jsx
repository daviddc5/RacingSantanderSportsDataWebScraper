import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
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
                className={isActive("/") ? "active" : ""}
                onClick={closeMenu}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                to="/squad"
                className={isActive("/squad") ? "active" : ""}
                onClick={closeMenu}
              >
                SQUAD
              </Link>
            </li>
            <li>
              <Link
                to="/history"
                className={isActive("/history") ? "active" : ""}
                onClick={closeMenu}
              >
                HISTORY
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className={isActive("/admin") ? "active" : ""}
                onClick={closeMenu}
              >
                ADMIN
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
