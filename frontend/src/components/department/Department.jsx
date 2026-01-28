import React, { useState } from "react";
import "./Department.css";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../footer/footer";

const allDepartments = [
  {
    category: "Engineering & Technology (B.Tech / B.E.)",
    emoji: "🛠️",
    type: "UG",
    departments: [
      "Computer Science Engineering (CSE)",
      "Information Technology (IT)",
      "Electronics and Communication Engineering (ECE)",
      "Electrical and Electronics Engineering (EEE)",
      "Mechanical Engineering",
      "Civil Engineering",
      "Automobile Engineering",
      "Artificial Intelligence and Data Science",
      "Mechatronics Engineering",
      "Chemical Engineering",
      "Biomedical Engineering",
      "Aerospace Engineering",
    ],
  },
  {
    category: "Commerce & Management",
    emoji: "📊",
    type: "UG",
    departments: [
      "Bachelor of Commerce (B.Com)",
      "B.Com (Hons.)",
      "Bachelor of Business Administration (BBA)",
    ],
  },
  {
    category: "Science (B.Sc)",
    emoji: "🧪",
    type: "UG",
    departments: [
      "B.Sc – Physics",
      "B.Sc – Chemistry",
      "B.Sc – Mathematics",
      "B.Sc – Computer Science",
      "B.Sc – Biotechnology",
      "B.Sc – Microbiology",
      "B.Sc – Environmental Science",
      "B.Sc – Information Technology",
    ],
  },
  {
    category: "Computer Applications",
    emoji: "🖥️",
    type: "UG",
    departments: ["Bachelor of Computer Applications (BCA)"],
  },
  {
    category: "Science (M.Sc)",
    emoji: "🎓",
    type: "PG",
    departments: [
      "M.Sc – Physics",
      "M.Sc – Chemistry",
      "M.Sc – Mathematics",
      "M.Sc – Computer Science",
      "M.Sc – Biotechnology",
      "M.Sc – Microbiology",
      "M.Sc – Data Analytics",
      "M.Sc – Environmental Science",
      "Master of Computer Applications (MCA)",
    ],
  },
  {
    category: "Management (PG)",
    emoji: "💼",
    type: "PG",
    departments: [
      "Master of Business Administration (MBA)",
      "Post Graduate Diploma in Management (PGDM)",
      "Executive MBA",
      "Master of Human Resource Management (MHRM)",
    ],
  },
  {
    category: "M.Tech / M.E.",
    emoji: "💻",
    type: "PG",
    departments: [
      "M.Tech – Computer Science",
      "M.Tech – Information Technology",
      "M.Tech – Electronics & Communication",
      "M.Tech – Mechanical",
      "M.Tech – Civil",
      "M.Tech – Artificial Intelligence",
      "M.Tech – Data Science",
      "M.Tech – Cyber Security",
      "M.Tech – Renewable Energy",
    ],
  },
];

const filters = ["All", "UG", "PG", "Engineering", "Science", "Management", "Applications"];

const Department = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [openCategory, setOpenCategory] = useState(null);

  const filteredData = allDepartments.filter((item) => {
    const matchesFilter =
      activeFilter === "All" ||
      item.type === activeFilter ||
      item.category.includes(activeFilter);

    const matchesSearch = item.departments.some((d) =>
      d.toLowerCase().includes(search.toLowerCase())
    );

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dept-page">

      {/* Banner */}
      <div className="dept-banner">
        <h1>Our Departments</h1>
        <p>Explore all Undergraduate & Postgraduate Departments of Our College</p>
      </div>

      {/* Search */}
      <div className="dept-search-container">
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="dept-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={activeFilter === f ? "active" : ""}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="dept-container">
        {filteredData.map((item, index) => (
          <div key={index} className="dept-category">

            {/* Accordion Header */}
            <div
              className="accordion-header"
              onClick={() => setOpenCategory(openCategory === index ? null : index)}
            >
              <h2>{item.emoji} {item.category}</h2>
              <span>{openCategory === index ? "▲" : "▼"}</span>
            </div>

            {/* Accordion Body */}
            <AnimatePresence>
              {openCategory === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="dept-card-grid"
                >
                  {item.departments.map((dept, idx) => (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      key={idx}
                      className="dept-card"
                    >
                      <span className="icon">🎓</span>
                      <p>{dept}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Department;
