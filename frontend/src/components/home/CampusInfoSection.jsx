import React from "react";
import "./CampusInfoSection.css";
import { Link } from "react-router-dom";
import { Bell, User, NotebookPen, LogIn } from "lucide-react";

import AntiRaggingImg from "../../assets/img1.png";
import ZeroToleranceImg from "../../assets/img2.png";

const CampusInfoSection = () => {
  return (
    <div className="campus-section">

      {/* LEFT COLUMN */}
      <div className="campus-box">
        <h2>Ragging Free Campus</h2>
        <img
          src={AntiRaggingImg}
          className="campus-img"
          alt="ragging"
        />
        <Link to="/anti-ragging" className="campus-link">
          Anti-Ragging Cell →
        </Link>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="campus-box">
        <h2>Zero Tolerance Policy</h2>
        <img
          src={ZeroToleranceImg}
          className="campus-img"
          alt="zero tolerance"
        />
        <Link to="/icc" className="campus-link">
          Internal Complaints Committee →
        </Link>
      </div>

      {/* RIGHT COLUMN */}
      <div className="quicklinks-box">
        <h2>Quicklinks</h2>

        <div className="quicklink-item">
          <User className="quick-icon" />
          <Link to="/student-dashboard">Student Dashboard →</Link>
        </div>

        <div className="quicklink-item">
          <LogIn className="quick-icon" />
          <Link to="/campus-login">Campus Login →</Link>
        </div>

        <div className="quicklink-item">
          <Bell className="quick-icon" />
          <Link to="/noticeboard">Noticeboard →</Link>
        </div>

        <div className="quicklink-item">
          <NotebookPen className="quick-icon" />
          <Link to="/alumni-helpdesk">Alumni Helpdesk →</Link>
        </div>
      </div>

    </div>
  );
};

export default CampusInfoSection;
