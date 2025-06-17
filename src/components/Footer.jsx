import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-column">
          <img
            src="/images/racingLogo.png"
            alt="Racing de Santander Crest"
            className="logo-footer"
          />
          <p>
            Founded in 1913. A historic club with a passionate heart. ¡Aúpa
            Racing!
          </p>
        </div>
        <div className="footer-column">
          <h4>NAVIGATION</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/squad">Squad</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>FOLLOW US</h4>
          <div className="social-icons">
            <a
              href="https://x.com/realracingclub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
              Twitter
            </a>
            <a
              href="https://www.instagram.com/realracingclub/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
              Instagram
            </a>
            <a
              href="https://www.youtube.com/realracingclubsantandersad"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="fab fa-youtube"></i>
              YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 David Diaz Clifton Racing Fan Page</p>
      </div>
    </footer>
  );
};

export default Footer;
