import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CounsellingList.css";

const CounsellingList = () => {
  const navigate = useNavigate();
  const [allApplications, setAllApplications] = useState([]);
  const [eligibleList, setEligibleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  
  // Filter criteria
  const [minPercentage, setMinPercentage] = useState(60);
  const [maxRank, setMaxRank] = useState(5000);
  const [courseFilter, setCourseFilter] = useState("all");

  // Fetch applications and courses
  useEffect(() => {
    fetchApplications();
    fetchCourses();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/applications");
      
      if (!res.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await res.json();
      
      // Only get non-draft applications
      const validApps = data.filter(app => !app.is_draft);
      
      setAllApplications(validApps);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load applications");
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Courses fetch error:", err);
    }
  };

  // Generate counselling list based on criteria
  const generateCounsellingList = () => {
    if (allApplications.length === 0) {
      alert("No applications available");
      return;
    }

    // Filter based on criteria - only pending applications
    let filtered = allApplications.filter(app => {
      const percentageValue = parseFloat(String(app.percentage).replace('%', ''));
      const examRankValue = parseInt(app.examRank);

      const meetsPercentage = percentageValue >= minPercentage;
      const meetsRank = examRankValue <= maxRank;
      const hasValidData = !isNaN(percentageValue) && !isNaN(examRankValue);
      const isPending = app.status === "pending"; // Only pending applications

      return hasValidData && meetsPercentage && meetsRank && isPending;
    });

    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(app => app.course_name === courseFilter);
    }

    if (filtered.length === 0) {
      alert("No students meet the counselling criteria");
      setEligibleList([]);
      return;
    }

    // Sort by exam rank (lower is better)
    const sorted = [...filtered].sort((a, b) => {
      const rankA = parseInt(a.examRank) || 999999;
      const rankB = parseInt(b.examRank) || 999999;
      return rankA - rankB;
    });

    setEligibleList(sorted);
    alert(`✅ Counselling list generated! ${sorted.length} eligible students found.`);
  };

  // Bulk approve eligible students
  const bulkApproveStudents = async () => {
    if (eligibleList.length === 0) {
      alert("Generate counselling list first!");
      return;
    }

    const pendingStudents = eligibleList.filter(s => s.status === "pending");

    if (pendingStudents.length === 0) {
      alert("All students in the list are already approved!");
      return;
    }

    if (!window.confirm(`Approve ${pendingStudents.length} eligible students in bulk?`)) {
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: pendingStudents.map(s => s.id)
        })
      });

      if (!res.ok) {
        throw new Error('Bulk approval failed');
      }

      const data = await res.json();
      alert(`✅ ${data.message}`);
      
      // Refresh applications
      await fetchApplications();
      
      // Update eligible list
      setEligibleList(prev =>
        prev.map(s =>
          pendingStudents.find(ps => ps.id === s.id) ? { ...s, status: 'approved' } : s
        )
      );
    } catch (err) {
      console.error('Bulk approval error:', err);
      alert('❌ Error approving students');
    }
  };

  if (loading) {
    return (
      <div className="counselling-container">
        <p>Loading applications...</p>
      </div>
    );
  }

  const approvedCount = eligibleList.filter(s => s.status === "approved").length;
  const selectedCount = eligibleList.filter(s => s.selection_status === "selected").length;
  const avgPercentage = eligibleList.length > 0
    ? (eligibleList.reduce((sum, s) => sum + parseFloat(String(s.percentage).replace('%', '')), 0) / eligibleList.length).toFixed(1)
    : 0;

  return (
    <div className="counselling-container">
      {/* Header */}
      <div className="counselling-header">
        <div>
          <h1 className="counselling-title">🎓 Counselling List & Approval</h1>
          <p className="counselling-subtitle">
            Generate list of eligible students and approve all of them.
          </p>
        </div>
        <button 
          className="btn-back" 
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {/* Criteria Configuration */}
      <div className="criteria-card">
        <h3>📊 Eligibility Criteria</h3>
        <div className="criteria-grid">
          <div className="criteria-item">
            <label>Minimum Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={minPercentage}
              onChange={(e) => setMinPercentage(parseFloat(e.target.value))}
            />
          </div>
          <div className="criteria-item">
            <label>Maximum Exam Rank</label>
            <input
              type="number"
              min="1"
              value={maxRank}
              onChange={(e) => setMaxRank(parseInt(e.target.value))}
            />
          </div>
          <div className="criteria-item">
            <label>Course Filter</label>
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn-generate" 
          onClick={generateCounsellingList}
        >
          🔍 Generate Counselling List
        </button>

        <button 
          className="btn-download" 
          onClick={bulkApproveStudents}
          disabled={eligibleList.length === 0}
          style={{ background: eligibleList.length === 0 ? '#9ca3af' : '#10b981' }}
        >
          ✅ Approve Eligible Students
        </button>
      </div>

      {/* Statistics */}
      {eligibleList.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p>Total Eligible</p>
              <h2>{eligibleList.length}</h2>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <p>Admin Approved</p>
              <h2>{approvedCount}</h2>
            </div>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p>Avg. Percentage</p>
              <h2>{avgPercentage}%</h2>
            </div>
          </div>
        </div>
      )}

      {/* Eligible Students List */}
      <div className="students-list">
        {eligibleList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Counselling List Generated</h3>
            <p>Set your criteria and click "Generate Counselling List" to begin</p>
            <div className="empty-info">
              <p><strong>Current Criteria:</strong></p>
              <p>✓ Percentage ≥ {minPercentage}%</p>
              <p>✓ Exam Rank ≤ {maxRank}</p>
              <p>✓ Status: Pending applications only</p>
            </div>
          </div>
        ) : (
          eligibleList.map((student, index) => (
            <div key={student.id} className="student-card">
              <div className={`rank-badge ${index < 10 ? 'top-rank' : ''}`}>
                {index + 1}
              </div>

              <div className="student-info">
                <h3>{student.student_name}</h3>
                <div className="student-details">
                  <span>📧 {student.email}</span>
                  <span>📱 {student.phone || 'N/A'}</span>
                  <span>📚 {student.course_name || 'N/A'}</span>
                </div>
                <div className="student-metrics">
                  <span className="metric percentage">
                    📊 {student.percentage}%
                  </span>
                  <span className="metric rank">
                    🏆 Rank: {student.examRank}
                  </span>
                  <span className={`metric status ${student.status === 'approved' ? 'called' : 'pending'}`}>
                    {student.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                  </span>
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CounsellingList;