import React from "react";
import "./Contact.css";
import { motion } from "framer-motion";
import Footer from "../footer/Footer";

const Contact = () => {
  return (
    <div className="contact-page">

      {/* HEADER */}
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We are here to assist you with admissions, information, and support.</p>
        <p className="breadcrumb">Home / Contact Us</p>
      </div>

      <div className="contact-container">

        {/* LEFT SIDE CONTENT */}
        <div className="contact-left">

          {/* OFFICE HOURS */}
          <motion.div className="office-hours" whileHover={{ scale: 1.02 }}>
            <h2>⏰ Office Hours</h2>
            <ul>
              <li><strong>Monday – Friday:</strong> 9:00 AM – 6:00 PM</li>
              <li><strong>Saturday:</strong> 10:00 AM – 2:00 PM</li>
              <li><strong>Sunday:</strong> Closed</li>
            </ul>
          </motion.div>

          <motion.div className="contact-card" whileHover={{ scale: 1.02 }}>
            <h2>📞 Admissions Helpline Number</h2>
            <p className="highlight-number">80107XXXXX / 80697XXXXX</p>
          </motion.div>

          <motion.div className="contact-card" whileHover={{ scale: 1.02 }}>
            <h2>🏢 TIE Group Admissions Office</h2>

            <p>WXYZ Building, Sector – V, XYZ Complex<br />
              Kolkata – 700 XXX, West Bengal, India.</p>

            <p><strong>Phone No.:</strong> +91 33 2357 XXXX, +91 33 2357 XXXX</p>
            <p><strong>Fax No.:</strong> +91 33 2357 XXXX</p>
            <p><strong>Email (Admissions):</strong> admissions@tie.edu.in</p>
          </motion.div>

          <motion.div className="contact-card" whileHover={{ scale: 1.02 }}>
            <h2>🏛️ TIE Group Administration Office</h2>
            <p>Management House, EC-XX, XYZ Complex,<br />
              Kolkata – 700 XXX, West Bengal, India.</p>
          </motion.div>

          {/* GOOGLE MAPS */}
          <motion.div className="map-card" whileHover={{ scale: 1.01 }}>
            <h2>📍 Find Us on Map</h2>
            <iframe
              title="TIE Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3687.9261488881245!2d88.431!3d22.576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM0JzMzLjYiTiA4OMKwMjYnMDkuNiJF!5e0!3m2!1sen!2sin!4v1709999999999"
              width="100%"
              height="370"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </motion.div>

          
        </div>

        {/* RIGHT SIDE — NEWS SECTION */}
        <div className="contact-right">
          <h2 className="news-title">📰 News and Achievements</h2>

          <motion.div className="news-card" whileHover={{ scale: 1.02 }}>
            <img src="src\components\contact\tie _create-a-thon.png" alt="news" />
            <div>
              <h3>TIE CREATE-A-THON 2025</h3>
              <p>2025-07-03 15:17:37</p>
            </div>
          </motion.div>

          <motion.div className="news-card" whileHover={{ scale: 1.02 }}>
            <img src="src\components\contact\tie_pic2.png" alt="news" />
            <div>
              <h3>12th Regional 3R and Circular Economy Forum</h3>
              <p>2025-07-03 15:17:37</p>
            </div>
          </motion.div>

          <motion.div className="news-card" whileHover={{ scale: 1.02 }}>
            <img src="src\components\contact\tie _create-a-thon.png" alt="news" />
            <div>
              <h3>TIE CREATE-A-THON 2025</h3>
              <p>2025-07-03 15:17:37</p>
            </div>
          </motion.div>

          <motion.div className="news-card" whileHover={{ scale: 1.02 }}>
            <img src="src\components\contact\tie_pic2.png" alt="news" />
            <div>
              <h3>12th Regional 3R and Circular Economy Forum</h3>
              <p>2025-07-03 15:17:37</p>
            </div>
          </motion.div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
