import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewsEvents.css";

const NewsEvents = () => {
  const navigate = useNavigate();

  const newsData = [
    {
      title: "TIE Delhi Hosts Innovators Summit 2025",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A grand summit bringing together entrepreneurs, investors, mentors and innovators from all over India.",
    },
    {
      title: "TIE organizes Startup Funding Workshop",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "This workshop introduced young founders to funding strategies, pitch deck creation, and networking.",
    },
    {
      title: "TIE Announces Women Entrepreneurship Drive",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A national Program designed to support women-led startups through mentoring and funding opportunities.",
    },
    {
      title: "TIE Launches New Accelerator Program",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A 12-week accelerator Program to help early-stage founders scale their startups with guidance from industry leaders.",
    },
  ];

  const [index, setIndex] = useState(0);

  const nextNews = () => {
    setIndex((prev) => (prev + 1) % newsData.length);
  };

  const prevNews = () => {
    setIndex((prev) => (prev - 1 + newsData.length) % newsData.length);
  };

  return (
    <div className="news-events-section">

      {/* LATEST NEWS */}
      <div className="latest-news">
        <div className="section-header">
          <h2><span className="red">LATEST</span> NEWS</h2>
          <button className="view-all-btn" onClick={() => navigate("/news")}>
            VIEW ALL
          </button>
        </div>

        <p className="sub-title">CAMPUS BULLETIN</p>

        <div className="carousel-container">
          <button className="arrow-btn" onClick={prevNews}>❮</button>

          <div className="news-card">
            <img src={newsData[index].img} alt="news" />
            <h3>{newsData[index].title}</h3>
            <p>{newsData[index].desc}</p>
          </div>

          <button className="arrow-btn" onClick={nextNews}>❯</button>
        </div>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="upcoming-events">
        <div className="section-header">
          <h2><span className="red">UPCOMING</span> EVENTS</h2>
          <button className="view-all-btn" onClick={() => navigate("/events")}>
            VIEW ALL
          </button>
        </div>

        <p className="sub-title">PROGRAMS ON PLATTER</p>

        <div className="event-card">
          <h3>
            STEM TEACHING AND LEARNING: Engagement and Belonging in Higher Education
          </h3>
          <p className="event-date">📅 November 25, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default NewsEvents;
