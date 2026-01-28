import React from "react";
import "./Faculty.css";
import Footer from "../footer/Footer";

const facultyData = [
  {
    name: "Dr. Ananya Sharma",
    dept: "Computer Science",
    qualifications: "PhD, M.Tech",
    email: "ananya.sharma@college.edu",
    experience: "10+ years",
    achievement: "Published 15+ research papers in AI and ML",
    photo: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Prof. Rohan Gupta",
    dept: "Mechanical Engineering",
    qualifications: "M.Tech (Thermal)",
    email: "rohan.gupta@college.edu",
    experience: "8 years",
    achievement: "Developed an award-winning solar engine prototype",
    photo: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    name: "Dr. Priya Mehta",
    dept: "Mathematics",
    qualifications: "PhD, M.Sc",
    email: "priya.mehta@college.edu",
    experience: "12 years",
    achievement: "Recognized as Best Mathematics Faculty in 2022",
    photo: "https://randomuser.me/api/portraits/women/47.jpg"
  },
  {
    name: "Prof. Arjun Verma",
    dept: "Electronics & Communication",
    qualifications: "M.Tech",
    email: "arjun.verma@college.edu",
    experience: "7 years",
    achievement: "Designed a low-cost embedded system for IoT labs",
    photo: "https://randomuser.me/api/portraits/men/40.jpg"
  },
  {
    name: "Dr. Kavita Rao",
    dept: "Physics",
    qualifications: "PhD",
    email: "kavita.rao@college.edu",
    experience: "11 years",
    achievement: "Published research in quantum optics",
    photo: "https://randomuser.me/api/portraits/women/50.jpg"
  },
  {
    name: "Prof. Siddharth Sen",
    dept: "Civil Engineering",
    qualifications: "M.Tech (Structural Engg.)",
    email: "siddharth.sen@college.edu",
    experience: "9 years",
    achievement: "Led 20+ structural safety audits across India",
    photo: "https://randomuser.me/api/portraits/men/55.jpg"
  },
  {
    name: "Dr. Ananya Sharma",
    dept: "Computer Science",
    qualifications: "PhD, M.Tech",
    email: "ananya.sharma@college.edu",
    experience: "10+ years",
    achievement: "Published 15+ research papers in AI and ML",
    photo: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Prof. Rohan Gupta",
    dept: "Mechanical Engineering",
    qualifications: "M.Tech (Thermal)",
    email: "rohan.gupta@college.edu",
    experience: "8 years",
    achievement: "Developed an award-winning solar engine prototype",
    photo: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    name: "Dr. Priya Mehta",
    dept: "Mathematics",
    qualifications: "PhD, M.Sc",
    email: "priya.mehta@college.edu",
    experience: "12 years",
    achievement: "Recognized as Best Mathematics Faculty in 2022",
    photo: "https://randomuser.me/api/portraits/women/47.jpg"
  },
  {
    name: "Prof. Arjun Verma",
    dept: "Electronics & Communication",
    qualifications: "M.Tech",
    email: "arjun.verma@college.edu",
    experience: "7 years",
    achievement: "Designed a low-cost embedded system for IoT labs",
    photo: "https://randomuser.me/api/portraits/men/40.jpg"
  },
  {
    name: "Dr. Kavita Rao",
    dept: "Physics",
    qualifications: "PhD",
    email: "kavita.rao@college.edu",
    experience: "11 years",
    achievement: "Published research in quantum optics",
    photo: "https://randomuser.me/api/portraits/women/50.jpg"
  },
  {
    name: "Prof. Siddharth Sen",
    dept: "Civil Engineering",
    qualifications: "M.Tech (Structural Engg.)",
    email: "siddharth.sen@college.edu",
    experience: "9 years",
    achievement: "Led 20+ structural safety audits across India",
    photo: "https://randomuser.me/api/portraits/men/55.jpg"
  }
];

export default function Faculty() {
  return (
    <div className="faculty-page">
      <h1 className="faculty-title">Our Faculty</h1>

      <div className="faculty-grid">
        {facultyData.map((faculty, index) => (
          <div className="faculty-card" key={index}>
            <img src={faculty.photo} alt={faculty.name} className="faculty-photo" />

            <h3 className="faculty-name">{faculty.name}</h3>
            <p className="faculty-dept">{faculty.dept}</p>
            <p className="faculty-qual"><b>Qualification:</b> {faculty.qualifications}</p>
            <p className="faculty-email"><b>Email:</b> {faculty.email}</p>
            <p className="faculty-exp"><b>Experience:</b> {faculty.experience}</p>
            <p className="faculty-ach"><b>Achievement:</b> {faculty.achievement}</p>
            <Footer />
          </div>
        ))}
      </div>
    </div>
  );
}