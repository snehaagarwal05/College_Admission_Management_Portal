import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminApplications.css";
import API_BASE_URL from "../../config";
const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch('${API_BASE_URL}/api/applications');
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        setError(data.error || "Failed to load applications");
        setApplications([]);
        return;
      }

      const sorted = [...data].sort((a, b) => a.id - b.id);
      setApplications(sorted);
    } catch (err) {
      console.error(err);
      setError("Network error while loading applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCourses = Array.from(
    new Set(applications.map((a) => a.course_name).filter(Boolean))
  ).sort();

  const filteredApps = applications
    .filter((app) => {
      const courseMatch = courseFilter === "All" || app.course_name === courseFilter;
      const statusMatch = statusFilter === "All" || app.status === statusFilter;
      return courseMatch && statusMatch;
    })
    .sort((a, b) => a.id - b.id);

  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="admin-title">
            <span role="img" aria-label="file">📄</span> All Submitted Applications
          </h1>
          <p style={{ color: '#718096', margin: '10px 0 0 0' }}>
            Review and manage student applications
          </p>
        </div>
        <button 
          className="btn-back" 
          onClick={() => navigate('/admin')}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="admin-actions" style={{ marginBottom: '20px' }}>
        <button 
          className="btn-action" 
          onClick={() => navigate('/admin/courses')}
          style={{ background: '#667eea' }}
        >
          📚 Manage Courses
        </button>
        <button 
          className="btn-action" 
          onClick={() => navigate('/admin/reports')}
          style={{ background: '#ed8936' }}
        >
          📊 View Reports
        </button>
        <button 
          className="btn-action" 
          onClick={() => navigate('/admin/counselling-list')}
          style={{ background: '#10b981' }}
        >
          🎓 Counselling List
        </button>
      </div>

      {loading && <p>Loading applications...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <label htmlFor="courseFilter">Filter by Course:</label>
        <select
          id="courseFilter"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="All">All Courses</option>
          {uniqueCourses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <label htmlFor="statusFilter" style={{ marginLeft: '20px' }}>Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {!loading && filteredApps.length === 0 && (
        <p>No applications found for this filter.</p>
      )}

      {filteredApps.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Percentage</th>
                <th>Exam Rank</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                return (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td style={{ fontWeight: '600', color: '#2d3748' }}>
                      {app.student_name}
                    </td>
                    <td>{app.email}</td>
                    <td>{app.course_name || "-"}</td>
                    <td>{app.percentage || "-"}</td>
                    <td>{app.examRank || "-"}</td>
                    <td>
                      <span className={`status-pill status-${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;