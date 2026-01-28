import React, { useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Footer from "../footer/footer";
import NewsEvents from "./NewsEvents";
import CampusInfoSection from "./CampusInfoSection";

const Home = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

const handleApplyClick = () => {
    navigate('/admissionPage');
  };
  return (
    <div className="home">
      {/* TOP BANNER */}
      <div className="top-banner">
        <div className="banner-overlay">
          <h1 className="banner-title">
            Technology Institute of Engineering
          </h1>
          <p className="banner-subtitle">
            Earns <span>A Grade Accreditation</span> from the National
            Accreditation Council (NAC), Government of India
          </p>
        </div>
      </div>

      {/* INFO BOXES */}
      <div className="banner-info-section floating-cards">
        <div className="info-box">
          <h2>UG & PG Courses</h2>
          <p>
            Explore 16+ industry-oriented programs built for future-ready
            engineers & managers.
          </p>
        </div>

        <div className="info-box dark">
          <h2>Beyond Education</h2>
          <p>
            200+ extracurricular activities, modern labs, mentoring and
            innovative ecosystem.
          </p>
        </div>

        <div className="info-box">
          <h2>Have a Question?</h2>
          <p>E: admissions@tie.edu.in</p>
          <p>P: +91 33 2357 XXXX</p>
        </div>
      </div>

      <NewsEvents />
      <CampusInfoSection />
      <button className="button" onClick={handleApplyClick}>
        🎓 Apply for Admission
      </button>
      <Footer />
    </div>
  );
};

export default Home;