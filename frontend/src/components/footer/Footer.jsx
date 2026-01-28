import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-line"></div>

      <div className="footer-content">
        <p>
          © {new Date().getFullYear()} Technology Institute of Engineering (TIE).
        </p>

        <div className="footer-links">
          <a href="/terms-of-use">Terms of Use</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
