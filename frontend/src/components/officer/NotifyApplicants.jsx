
import React, { useEffect, useState } from "react";
import "./NotifyApplicants.css";
import API_BASE_URL from "../../config";
const NotifyApplicants = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("${API_BASE_URL}/api/applications");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    };

    fetchStudents();
  }, []);

  const filteredList = students.filter((s) => {
    if (filter === "selected" && s.selection_status !== "selected") return false;
    if (filter === "waitlisted" && s.selection_status !== "waitlisted") return false;
    if (search && !s.student_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  /* 🚀 NEW FUNCTION — send notifications to backend */
  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    const selectedIds = filteredList.map((s) => s.id);

    try {
      const res = await fetch("${API_BASE_URL}/api/officer/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedIds,
          message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage("");
        setTimeout(() => setSuccess(false), 2000);
      } else {
        alert("Error sending notifications");
      }
    } catch (error) {
      console.error("Notify error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="notify-container">
      <h1 className="notify-title">📢 Notify Applicants</h1>
      <p className="notify-subtitle">Send notifications to shortlisted or waitlisted candidates</p>

      {/* Filters */}
      <div className="notify-filters">
        <input
          type="text"
          placeholder="Search student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Students</option>
          <option value="selected">Selected Only</option>
          <option value="waitlisted">Waitlisted Only</option>
        </select>
      </div>

      {/* Students list */}
      <div className="student-list">
        {filteredList.map((s) => (
          <div key={s.id} className="student-card">
            <h3>{s.student_name}</h3>
            <p>Email: {s.email}</p>
            <p>Status: <strong>{s.status}</strong></p>
          </div>
        ))}

        {filteredList.length === 0 && (
          <p className="empty">No matching students found</p>
        )}
      </div>

      {/* Message box */}
      <div className="notify-message-box">
        <textarea
          rows="4"
          placeholder="Write your message to selected applicants..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button className="notify-btn" onClick={handleSend}>
          📨 Send Notification
        </button>
      </div>

      {/* Success popup */}
      {success && (
        <div className="success-popup">
          🎉 Notification sent successfully!
        </div>
      )}
    </div>
  );
};

export default NotifyApplicants;
