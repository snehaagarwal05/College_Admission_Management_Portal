import React, { useState } from 'react';
import './NIRF.css';
import Footer from "../footer/footer";

const NIRF = () => {
  const [selectedYear, setSelectedYear] = useState('2024');

  const achievements = [
    {
      icon: '🏆',
      title: 'Top 10 Overall',
      description: 'Ranked 7th among all institutions in India',
      color: '#FFD700'
    },
    {
      icon: '🔧',
      title: 'Top 5 Engineering',
      description: 'Ranked 5th in Engineering category nationwide',
      color: '#FF6B6B'
    },
    {
      icon: '💼',
      title: 'Top 10 Management',
      description: 'Ranked 8th in Management programs',
      color: '#4ECDC4'
    },
    {
      icon: '💡',
      title: 'Top 10 Innovation',
      description: 'Ranked 6th for Innovation and Research',
      color: '#95E1D3'
    }
  ];

  const highlights = [
    {
      icon: '👨‍🎓',
      number: '98.5%',
      label: 'Placement Rate',
      color: '#6366F1'
    },
    {
      icon: '💰',
      number: '₹12.5 LPA',
      label: 'Average Package',
      color: '#EC4899'
    },
    {
      icon: '📊',
      number: '250+',
      label: 'Research Papers',
      color: '#10B981'
    },
    {
      icon: '🏢',
      number: '200+',
      label: 'Top Companies',
      color: '#F59E0B'
    }
  ];

  const topColleges = [
    { rank: 1, name: 'Alpha Institute of Technology', score: 90.04, logo: '🏛️' },
    { rank: 2, name: 'Beta Engineering College', score: 87.84, logo: '🏛️' },
    { rank: 3, name: 'Gamma Technical University', score: 87.02, logo: '🏛️' },
    { rank: 4, name: 'Delta Institute of Sciences', score: 84.21, logo: '🏛️' },
    { rank: 5, name: 'Epsilon Tech College', score: 82.56, logo: '🏛️' },
    { rank: 6, name: 'Zeta Engineering Institute', score: 79.32, logo: '🏛️' },
    { rank: 7, name: 'TIE College', score: 78.95, logo: '🎓', highlight: true },
    { rank: 8, name: 'Theta National Institute', score: 76.48, logo: '🏛️' },
    { rank: 9, name: 'Iota Technology Hub', score: 75.23, logo: '🏛️' },
    { rank: 10, name: 'Kappa Engineering Academy', score: 73.91, logo: '🏛️' }
  ];

  const parameters = [
    {
      name: 'Teaching, Learning & Resources',
      score: 92.5,
      icon: '📚',
      description: 'Student-faculty ratio, teaching methodology, and infrastructure'
    },
    {
      name: 'Research & Professional Practice',
      score: 88.3,
      icon: '🔬',
      description: 'Research publications, patents, and consultancy projects'
    },
    {
      name: 'Graduation Outcomes',
      score: 95.8,
      icon: '🎓',
      description: 'Placements, higher studies, and median salary'
    },
    {
      name: 'Outreach and Inclusivity',
      score: 87.2,
      icon: '🌍',
      description: 'Regional diversity, women participation, and social initiatives'
    },
    {
      name: 'Perception',
      score: 91.6,
      icon: '⭐',
      description: 'Peer perception, employer feedback, and reputation'
    }
  ];

  return (
    <div className="nirf-container">
      {/* Hero Section */}
      <div className="nirf-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>NIRF Ranked</span>
          </div>
          <h1 className="hero-title">
            India's Top <span className="highlight-text">7th</span> Ranked Institution
          </h1>
          <p className="hero-subtitle">
            Recognized by NIRF (National Institutional Ranking Framework) - Ministry of Education, Govt. of India
          </p>
          
          <div className="year-selector">
            {['2024', '2023', '2022'].map(year => (
              <button
                key={year}
                className={selectedYear === year ? 'year-btn active' : 'year-btn'}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        
        <div className="floating-ranks">
          <div className="rank-badge overall">
            <span className="rank-number">#7</span>
            <span className="rank-label">Overall</span>
          </div>
          <div className="rank-badge engineering">
            <span className="rank-number">#5</span>
            <span className="rank-label">Engineering</span>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <section className="achievements-section">
        <div className="section-header">
          <h2>🎯 Our Achievements</h2>
          <p>Excellence recognized across multiple categories</p>
        </div>
        
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-card" style={{backgroundColor: achievement.color}}>
              <div className="achievement-icon">{achievement.icon}</div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Performance Highlights */}
      <section className="highlights-section">
        <div className="highlights-grid">
          {highlights.map((item, index) => (
            <div key={index} className="highlight-card">
              <div className="highlight-icon">{item.icon}</div>
              <div className="highlight-number" style={{color: item.color}}>{item.number}</div>
              <div className="highlight-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top 10 Rankings Table */}
      <section className="rankings-section">
        <div className="section-header">
          <h2>📊 Top 10 Engineering Institutions in India</h2>
          <p>NIRF Rankings 2024</p>
        </div>
        
        <div className="rankings-table">
          {topColleges.map((college, index) => (
            <div 
              key={index} 
              className={college.highlight ? 'ranking-card our-college' : 'ranking-card'}
            >
              <div className="rank-position">
                <span className="rank-hash">#</span>
                <span className="rank-num">{college.rank}</span>
              </div>
              
              <div className="college-info">
                <div className="college-logo">{college.logo}</div>
                <div className="college-details">
                  <h3>{college.name}</h3>
                  {college.highlight && (
                    <span className="our-badge">🎓 Our College</span>
                  )}
                </div>
              </div>
              
              <div className="college-score">
                <div className="score-number">{college.score}</div>
                <div className="score-label">NIRF Score</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NIRF Parameters */}
      <section className="parameters-section">
        <div className="section-header">
          <h2>📈 NIRF Assessment Parameters</h2>
          <p>Our performance across key evaluation criteria</p>
        </div>
        
        <div className="parameters-grid">
          {parameters.map((param, index) => (
            <div key={index} className="parameter-card">
              <div className="param-header">
                <div className="param-icon">{param.icon}</div>
                <h3>{param.name}</h3>
              </div>
              
              <div className="param-score">
                <div className="score-display">
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{width: param.score + '%'}}
                    ></div>
                  </div>
                  <div className="score-text">{param.score}</div>
                </div>
              </div>
              
              <p className="param-description">{param.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="banner-content">
          <div className="banner-icon">ℹ️</div>
          <div className="banner-text">
            <h3>About NIRF Rankings</h3>
            <p>
              The National Institutional Ranking Framework (NIRF) was approved by the MHRD and launched on September 29, 2015. 
              This framework outlines a methodology to rank institutions across India based on common parameters including 
              Teaching, Learning & Resources, Research and Professional Practices, Graduation Outcomes, Outreach and Inclusivity, and Perception.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NIRF;
