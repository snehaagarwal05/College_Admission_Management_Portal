import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="navbar-logo">TIE College</div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>         
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/admission">Admission</Link></li>
          <li><Link to="/nirf">NIRF Ranking</Link></li>
          <li><Link to="/faculty">Faculty</Link></li>
          <li><Link to="/campus">Campus Life</Link></li>
          <li><Link to="/department">Department</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li className="nav-item login-item"><Link to="/login" className="nav-link login-link">Login</Link></li>
        </ul>
      </div>

      <div
        className={`hamburger ${isOpen ? "toggle" : ""}`}
        onClick={toggleMenu}
      >
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
