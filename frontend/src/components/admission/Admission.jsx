import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Admission.css';
import Footer from "../footer/footer";

const Admission = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      name: 'B.Tech',
      duration: '4 Years',
      qualification: '10+2 with Physics, Chemistry, and Mathematics (Min 60%)',
      fees: '₹1,20,000 per year',
      eligibility: 'JEE Main / WBJEE qualified'
    },
    {
      id: 2,
      name: 'B.Sc',
      duration: '4 Years',
      qualification: '10+2 with PCM (Min 60%)',
      fees: '₹1,30,000 per year',
      eligibility: 'Merit-based admission'
    },
    {
      id: 3,
      name: 'M.Sc',
      duration: '4 Years',
      qualification: '10+2 with Physics, Chemistry, and Mathematics (Min 60%)',
      fees: '₹1,25,000 per year',
      eligibility: 'Merit-based admission'
    },
    {
      id: 4,
      name: 'M.Tech',
      duration: '2 Years',
      qualification: 'B.Tech/B.E. in relevant field (Min 60%)',
      fees: '₹90,000 per year',
      eligibility: 'GATE qualified'
    },
    {
      id: 6,
      name: 'MBA',
      duration: '2 Years',
      qualification: 'Bachelor\'s Degree in any discipline (Min 50%)',
      fees: '₹1,50,000 per year',
      eligibility: 'CAT / MAT / CMAT qualified'
    },
    {
      id: 7,
      name: 'BBA',
      duration: '3 Years',
      qualification: '10+2 in any stream (Min 50%)',
      fees: '₹80,000 per year',
      eligibility: 'Merit-based admission'
    },
    {
      id: 8,
      name: 'MCA',
      duration: '2 Years',
      qualification: 'BCA/B.Sc. (CS/IT) or equivalent (Min 55%)',
      fees: '₹95,000 per year',
      eligibility: 'Entrance exam or merit-based'
    },
    {
      id: 9,
      name: 'BCA',
      duration: '3 Years',
      qualification: '10+2 with Mathematics (Min 50%)',
      fees: '₹75,000 per year',
      eligibility: 'Merit-based admission'
    }
  ];

  const topRecruiters = [
    { name: 'XYZ', logo: '🏢' },
    { name: 'ABC', logo: '💼' },
    { name: 'WER', logo: '🌐' },
    { name: 'POI', logo: '⚡' },
    { name: 'MNB', logo: '🎯' },
    { name: 'IBM', logo: '💻' },
    { name: 'AMZN', logo: '📦' },
    { name: 'GGL', logo: '🔍' },
    { name: 'MICROSFT', logo: '🪟' },
    { name: 'ACCENTRE', logo: '🚀' }
  ];

  const handleApplyClick = () => {
    navigate('/admissionPage');
  };

  return (
    <div className="admission-container">
      <div className="admission-header">
        <h1>Admissions 2025-26</h1>
        <p>Join the Top Ranked Engineering College in Kolkata, Eastern India</p>
      </div>

      <div className="admission-content">
        {/* Left Section - Courses (60%) */}
        <div className="courses-section">
          <h2>📚 Available Courses</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span className="duration-badge">{course.duration}</span>
                </div>
                <div className="course-details">
                  <div className="detail-item">
                    <strong>📋 Qualification:</strong>
                    <p>{course.qualification}</p>
                  </div>
                  <div className="detail-item">
                    <strong>✅ Eligibility:</strong>
                    <p>{course.eligibility}</p>
                  </div>
                  <div className="detail-item fees">
                    <strong>💰 Fees:</strong>
                    <p className="fees-amount">{course.fees}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Recruiters & Apply Button (40%) */}
        <div className="sidebar-section">
          <div className="sidebar-sticky">
            {/* Top Recruiters */}
            <div className="recruiters-card">
              <h2>🏆 Top Recruiters</h2>
              <div className="recruiters-grid">
                {topRecruiters.map((recruiter, index) => (
                  <div key={index} className="recruiter-item">
                    <span className="recruiter-logo">{recruiter.logo}</span>
                    <span className="recruiter-name">{recruiter.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button className="apply-button" onClick={handleApplyClick}>
              🎓 Apply for Admission
            </button>

            {/* Additional Info */}
            <div className="info-card">
              <h3>📞 Need Help?</h3>
              <p>Contact our Admission Office</p>
              <p><strong>Phone:</strong> +91-33-1234-5678</p>
              <p><strong>Email:</strong> admissions@xyzcolege.edu</p>
              <p><strong>Timings:</strong> Mon-Sat, 9 AM - 5 PM</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admission;
