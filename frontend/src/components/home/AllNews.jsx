import React from "react";
import "./AllNews.css";

const AllNews = () => {
  const allNews = [
    {
      title: "TIE Delhi Hosts Innovators Summit 2025",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A grand summit bringing together entrepreneurs, investors, mentors and innovators from all over India.",
    },
    {
      title: "TIE organizes Startup Funding Workshop",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "Session introduced young founders to funding strategies, pitch deck creation, and networking.",
    },
    {
      title: "TIE Announces Women Entrepreneurship Drive",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A national program designed to support women-led startups through mentoring and funding.",
    },
    {
      title: "TIE Launches New Accelerator Program",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A 12-week accelerator program to help early-stage founders scale.",
    },
    {
      title: "TIE Startup Bootcamp starts in February",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "Hands-on sessions on team building, idea validation and MVP creation.",
    },
    {
      title: "TIE Hackathon 2025 Announced",
      img: "https://i.postimg.cc/3NKNkLhz/dance.jpg",
      desc: "A 48-hour hackathon designed to solve real-world industry problems.",
    }
  ];

  return (
    <div className="all-news-page">
      <h1 className="news-heading">All <span className="red">News</span></h1>

      <div className="news-grid">
        {allNews.map((item, idx) => (
          <div className="news-card-large" key={idx}>
            <img src={item.img} alt="news" />
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllNews;
