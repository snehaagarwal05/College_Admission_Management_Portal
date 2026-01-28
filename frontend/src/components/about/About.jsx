import React from "react";
import "./About.css";
import { motion } from "framer-motion";
import Footer from "../footer/footer";

const About = () => {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <div className="about-banner">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About Technology Institute of Engineering (TIE)
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Empowering Innovation. Engineering the Future.
        </motion.p>
      </div>

      {/* About Description */}
      <div className="about-section">
        <h2>Who We Are</h2>
        <p>
          Technology Institute of Engineering (TIE), established in 2005, is one of 
          India’s leading engineering institutions dedicated to academic excellence, 
          innovation, and real-world skills. TIE offers top-tier undergraduate and 
          postgraduate programs in engineering, technology, science, and management.  
          With cutting-edge laboratories, industry-collaborated learning, and 
          world-class faculty, TIE shapes the engineers and innovators of tomorrow.
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="stat-card"
        >
          <h3>18+</h3>
          <p>Years of Excellence</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="stat-card"
        >
          <h3>6,500+</h3>
          <p>Students Enrolled</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="stat-card"
        >
          <h3>120+</h3>
          <p>Faculty Members</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="stat-card"
        >
          <h3>40+</h3>
          <p>Industry Collaborations</p>
        </motion.div>
      </div>

      {/* Vision & Mission */}
      <div className="vision-mission">
        <div className="vm-card">
          <h2>🎯 Vision</h2>
          <p>
            To be a global leader in engineering education and research, fostering
            innovation and contributing to technological advancements for a sustainable future.
          </p>
        </div>

        <div className="vm-card">
          <h2>🚀 Mission</h2>
          <ul>
            <li>Deliver world-class engineering education.</li>
            <li>Promote innovation, research, and entrepreneurship.</li>
            <li>Build strong industry partnerships for experiential learning.</li>
            <li>Develop responsible, skilled, and ethical engineering professionals.</li>
          </ul>
        </div>
      </div>

      {/* Campus Highlights */}
      <div className="highlights-section">
        <h2>Campus Highlights</h2>

        <div className="highlight-grid">

          <motion.div whileHover={{ scale: 1.05 }} className="highlight-card">
            <span>🏫</span>
            <h3>Modern Infrastructure</h3>
            <p>Wi-Fi enabled smart classrooms, modern labs, and digital libraries.</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="highlight-card">
            <span>🔬</span>
            <h3>Advanced Research Labs</h3>
            <p>AI, Robotics, IoT, and Cyber Security labs with industry-level tools.</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="highlight-card">
            <span>🤝</span>
            <h3>Industry Collaboration</h3>
            <p>Strong partnerships with TCS, Infosys, Wipro, Bosch, and more.</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="highlight-card">
            <span>🎓</span>
            <h3>Excellent Placements</h3>
            <p>90%+ placement rate with top recruiters across engineering domains.</p>
          </motion.div>

        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-section">
        <h2>Our Journey</h2>

        <div className="timeline">

          <div className="timeline-item">
            <div className="circle"></div>
            <h3>2005</h3>
            <p>TIE was founded with 3 engineering departments.</p>
          </div>

          <div className="timeline-item">
            <div className="circle"></div>
            <h3>2010</h3>
            <p>Established our first AI & Robotics research centre.</p>
          </div>

          <div className="timeline-item">
            <div className="circle"></div>
            <h3>2017</h3>
            <p>Newest academic block and laboratories inaugurated.</p>
          </div>

          <div className="timeline-item">
            <div className="circle"></div>
            <h3>2022</h3>
            <p>Ranked among Top 50 emerging engineering institutes in India.</p>
          </div>

        </div>
      </div>
      <Footer />

    </div>
  );
};

export default About;
