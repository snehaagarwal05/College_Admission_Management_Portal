import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEligible: 0,
    verifiedDocuments: 0,
    selectedStudents: 0,
    pendingReview: 0,
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("eligible");
  const [documentRequest, setDocumentRequest] = useState("");
const [selectedCourse, setSelectedCourse] = useState(""); // Changed from selectedDepartment
const [interviewDate, setInterviewDate] = useState("");
const [courses, setCourses] = useState([]); // Changed from departments
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchApplications();
    fetchCourses();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/officer/stats");
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Stats server error:", errorData);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Stats loaded:", data);
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
      alert(`Failed to load statistics: ${err.message}\n\nCheck the backend console for database errors.`);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/officer/applications");
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error(`HTTP error! status: ${res.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await res.json();
      console.log("Applications loaded:", data);
      
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        console.error("Expected array but got:", data);
        alert("Error: Server returned invalid data format. Check console for details.");
        setApplications([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading applications:", err);
      alert(`Failed to load applications: ${err.message}\n\nCheck the backend console for database errors.`);
      setApplications([]);
      setLoading(false);
    }
  };
  const fetchCourses = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/courses");
    const coursesData = await res.json();
    
    console.log("Courses fetched:", coursesData);
    
    setCourses(coursesData);
  } catch (err) {
    console.error("Error fetching courses:", err);
    alert("Failed to load courses. Please refresh the page.");
  }
};
  const verifyDocuments = async (appId, verified) => {
    if (!verified) {
      // If documents are rejected, confirm the rejection
      if (!window.confirm("Rejecting documents will automatically REJECT this student's application. This action cannot be undone. Continue?")) {
        return;
      }

      // Use a combined endpoint that handles both verification and selection rejection
      try {
        const res = await fetch(`http://localhost:5000/api/applications/${appId}/reject-documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            officer_verified: 0,
            selection_status: "rejected"
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to reject documents");
        }

        alert("❌ Documents rejected. Student has been automatically rejected from the admission process.");
        setShowModal(false);
        fetchApplications();
        fetchStats();
      } catch (err) {
        console.error("Error rejecting documents:", err);
        alert("Error processing document rejection: " + err.message);
      }
    } else {
      // Verify documents normally
      try {
        const res = await fetch(`http://localhost:5000/api/applications/${appId}/officer-verification`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ officer_verified: 1 }),
        });

        if (res.ok) {
          alert("✅ Documents verified successfully!");
          fetchApplications();
          fetchStats();
        } else {
          alert("Failed to verify documents");
        }
      } catch (err) {
        console.error("Error verifying documents:", err);
        alert("Error processing document verification");
      }
    }
  };

  const requestDocuments = async (appId) => {
    if (!documentRequest.trim()) {
      alert("Please specify which documents to request");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/request-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: documentRequest }),
      });

      if (res.ok) {
        alert("Document request sent successfully to student");
        setDocumentRequest("");
        fetchApplications();
      }
    } catch (err) {
      console.error("Error requesting documents:", err);
    }
  };

  const scheduleBulkInterviews = async () => {
  if (!selectedCourse) {
    alert("Please select a course");
    return;
  }

  if (!interviewDate) {
    alert("Please select an interview date and time");
    return;
  }

  if (!window.confirm(`Schedule interviews for all verified students in ${courses.find(c => c.id === parseInt(selectedCourse))?.name}?\n\nInterview Date: ${new Date(interviewDate).toLocaleString()}`)) {
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/officer/bulk-schedule-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourse, // Changed from department
        interviewDate: interviewDate
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`✅ Interviews scheduled successfully!\n\n${data.scheduled} students scheduled for ${data.courseName}.`);
      setShowInterviewModal(false);
      setSelectedCourse("");
      setInterviewDate("");
      fetchApplications();
      fetchStats();
    } else {
      alert(`❌ Error: ${data.error || 'Failed to schedule interviews'}`);
    }
  } catch (err) {
    console.error("Error scheduling bulk interviews:", err);
    alert("Failed to schedule interviews");
  }
};
      

  const updateSelectionStatus = async (appId, selectionStatus, skipValidation = false) => {
    const app = applications.find(a => a.id === appId);
    
    // Validation: Must complete all steps before selection (skip if auto-rejecting)
    if (!skipValidation) {
      if (!app.officer_verified) {
        alert("⚠️ Please verify documents first before selecting!");
        return;
      }

      if (!app.interview_date) {
        alert("⚠️ Please schedule an interview before selecting!");
        return;
      }

      if (!window.confirm(`Are you sure you want to mark this student as ${selectionStatus.toUpperCase()}?`)) {
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:5000/api/officer/selection/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectionStatus }),
      });

      const result = await res.json();
      
      if (res.ok) {
        if (!skipValidation) {
          alert(`✅ Student ${selectionStatus} successfully!`);
          setShowModal(false);
        }
        fetchApplications();
        fetchStats();
      } else {
        alert(`Error: ${result.error || 'Failed to update status'}`);
      }
    } catch (err) {
      console.error("Error updating selection status:", err);
      alert("Network error occurred");
    }
  };

  // Filter only admin-approved (eligible) applications
  const eligibleApps = applications.filter(app => app.status === "approved");

  const filteredApplications = eligibleApps.filter((app) => {
    if (filterStatus === "eligible") return true;
    if (filterStatus === "verified") return app.officer_verified === 1;
    if (filterStatus === "interview-scheduled") return app.interview_date !== null;
    if (filterStatus === "selected") return app.selection_status === "selected";
    if (filterStatus === "waitlisted") return app.selection_status === "waitlisted";
    if (filterStatus === "rejected") return app.selection_status === "rejected";
    if (filterStatus === "pending-verification") return !app.officer_verified;
    return true;
  });

  const getProgressStage = (app) => {
    if (app.selection_status === "selected") return { text: "✅ Selected", color: "#10b981" };
    if (app.selection_status === "rejected") return { text: "❌ Rejected", color: "#ef4444" };
    if (app.selection_status === "waitlisted") return { text: "⏳ Waitlisted", color: "#f59e0b" };
    if (app.interview_date) return { text: "📅 Interview Scheduled", color: "#8b5cf6" };
    if (app.officer_verified) return { text: "✓ Documents Verified", color: "#3b82f6" };
    return { text: "⏳ Pending Verification", color: "#f59e0b" };
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }
  const sendAdmissionLetters = async () => {
  if (!window.confirm("Generate admission letters for all selected students who have paid their fees?\n")) {
    return;
  }

  try {
    const res = await fetch(
      "http://localhost:5000/api/officer/send-admission-letters",
      { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }
    );

    const data = await res.json();

    if (res.ok) {
      const message = 
        `✅ Admission Letters Generated!\n\n` +
        `📊 Summary:\n` +
        `• Total Eligible: ${data.stats.total}\n` +
        `• Successfully Generated: ${data.stats.successful}\n` +
        `• Failed: ${data.stats.failed}\n\n` +
        (data.errors && data.errors.length > 0 
          ? `⚠️ Errors:\n${data.errors.slice(0, 3).join('\n')}${data.errors.length > 3 ? '\n... and more' : ''}` 
          : `Students can now download their admission letters from their dashboard!`);
      
      alert(message);
      
      // Refresh the data
      fetchApplications();
      fetchStats();
    } else {
      alert(`❌ Error: ${data.error || 'Failed to generate admission letters'}`);
    }

  } catch (err) {
    console.error("Error:", err);
    alert("❌ Network error: Failed to connect to server. Please check if the backend is running.");
  }
};
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui", background: "#f9fafb", minHeight: "100vh" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "5px", color: "#111827" }}>
          Admission Officer Dashboard
        </h1>
        <p style={{ color: "#6b7280" }}>Process eligible students through verification → interview → selection</p>
        <button
  onClick={() => setShowInterviewModal(true)}  // ✅ CORRECT
  style={{
    marginBottom: "15px",
    padding: "10px 18px",
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }}
>
  📅 Schedule Bulk Interviews
</button>
<button
  onClick={sendAdmissionLetters}
  style={{
    marginBottom: "15px",
    padding: "10px 18px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }}
>
  📄 Send Admission Letters
</button>

      </header>

{showInterviewModal && (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setShowInterviewModal(false)}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "12px", padding: "30px", maxWidth: "500px", width: "100%" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px", color: "#111827" }}>
        📅 Schedule Bulk Interviews by Course
      </h2>
      
      <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
        Schedule interviews for all verified students in a specific course who don't have interviews scheduled yet.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
          Select Course *
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{ width: "100%", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }}
        >
          <option value="">Choose Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.department})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
          Interview Date & Time *
        </label>
        <input
          type="datetime-local"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          style={{ width: "100%", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={scheduleBulkInterviews}
          style={{ flex: 1, padding: "10px 20px", background: "#8b5cf6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
        >
          📅 Schedule Interviews
        </button>
        <button
          onClick={() => {
            setShowInterviewModal(false);
            setSelectedCourse("");
            setInterviewDate("");
          }}
          style={{ padding: "10px 20px", background: "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Stats Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "25px", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.9 }}>📋 Eligible Students</h3>
          <p style={{ fontSize: "36px", fontWeight: "700", margin: 0 }}>{eligibleApps.length}</p>
          <p style={{ fontSize: "12px", marginTop: "5px", opacity: 0.8 }}>Admin Approved</p>
        </div>

        <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", padding: "25px", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.9 }}>✓ Verified Documents</h3>
          <p style={{ fontSize: "36px", fontWeight: "700", margin: 0 }}>{stats.verifiedDocuments}</p>
        </div>

        <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", padding: "25px", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.9 }}>🎯 Selected Students</h3>
          <p style={{ fontSize: "36px", fontWeight: "700", margin: 0 }}>{stats.selectedStudents}</p>
        </div>

        <div style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", padding: "25px", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.9 }}>⏳ Pending Review</h3>
          <p style={{ fontSize: "36px", fontWeight: "700", margin: 0 }}>{stats.pendingReview}</p>
        </div>
      </section>

      {/* Process Flow Info */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "30px", border: "1px solid #e5e7eb" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#111827" }}>
          📋 Selection Process Workflow
        </h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ padding: "8px 16px", background: "#eff6ff", color: "#1e40af", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>
            1️⃣ Verify Documents
          </span>
          <span style={{ fontSize: "20px", color: "#cbd5e0" }}>→</span>
          <span style={{ padding: "8px 16px", background: "#fef3c7", color: "#92400e", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>
            2️⃣ Request Additional Docs (if needed)
          </span>
          <span style={{ fontSize: "20px", color: "#cbd5e0" }}>→</span>
          <span style={{ padding: "8px 16px", background: "#f3e8ff", color: "#6b21a8", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>
            3️⃣ Schedule Interview
          </span>
          <span style={{ fontSize: "20px", color: "#cbd5e0" }}>→</span>
          <span style={{ padding: "8px 16px", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }}>
            4️⃣ Select/Waitlist/Reject
          </span>
        </div>
        
      </div>

      {/* Applications Management Section */}
      <section style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "25px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: 0 }}>
            Eligible Students (Admin Approved)
          </h2>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", cursor: "pointer" }}>
            <option value="eligible">All Eligible</option>
            <option value="pending-verification">Pending Verification</option>
            <option value="verified">Documents Verified</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="selected">Selected</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            {filterStatus === "eligible" 
              ? "No eligible students yet. Waiting for Admin to approve students from Counselling List."
              : "No students match this filter"}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>ID</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Student Name</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Course</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Percentage</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Rank</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Progress</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const progress = getProgressStage(app);
                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px", color: "#111827" }}>{app.id}</td>
                      <td style={{ padding: "12px", color: "#111827", fontWeight: "600" }}>{app.student_name}</td>
                      <td style={{ padding: "12px", color: "#111827" }}>{app.course_name || "N/A"}</td>
                      <td style={{ padding: "12px", color: "#111827" }}>{app.percentage}%</td>
                      <td style={{ padding: "12px", color: "#111827" }}>{app.examRank}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${progress.color}20`, color: progress.color }}>
                          {progress.text}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button 
                          onClick={() => { setSelectedApp(app); setShowModal(true); }} 
                          disabled={app.selection_status === "rejected"}
                          style={{ 
                            padding: "6px 16px", 
                            background: app.selection_status === "rejected" ? "#9ca3af" : "#3b82f6", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: app.selection_status === "rejected" ? "not-allowed" : "pointer", 
                            fontSize: "14px", 
                            fontWeight: "500",
                            opacity: app.selection_status === "rejected" ? 0.6 : 1
                          }}
                        >
                          {app.selection_status === "rejected" ? "Rejected" : "Process"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Application Details Modal */}
      {showModal && selectedApp && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "12px", padding: "30px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px", color: "#111827" }}>
              Process Application #{selectedApp.id} - {selectedApp.student_name}
            </h2>

            {/* Rejected Warning */}
            {selectedApp.selection_status === "rejected" && (
              <div style={{ marginBottom: "20px", padding: "15px", background: "#fee2e2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#991b1b", fontWeight: "600" }}>
                  ❌ This application has been rejected and cannot be processed further.
                </p>
              </div>
            )}

            {/* Progress Checklist */}
            <div style={{ marginBottom: "25px", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", color: "#111827" }}>Progress Checklist</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{selectedApp.officer_verified ? "✅" : "⬜"}</span>
                  <span style={{ color: "#374151" }}>Documents Verified</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{selectedApp.interview_date ? "✅" : "⬜"}</span>
                  <span style={{ color: "#374151" }}>Interview Scheduled</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{selectedApp.selection_status ? "✅" : "⬜"}</span>
                  <span style={{ color: "#374151" }}>Final Decision Made</span>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div style={{ marginBottom: "25px", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px", color: "#111827" }}>Student Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                <p style={{ marginBottom: "5px", color: "#374151" }}><strong>Email:</strong> {selectedApp.email}</p>
                <p style={{ marginBottom: "5px", color: "#374151" }}><strong>Phone:</strong> {selectedApp.phone || "N/A"}</p>
                <p style={{ marginBottom: "5px", color: "#374151" }}><strong>Course:</strong> {selectedApp.course_name || "N/A"}</p>
                <p style={{ marginBottom: "5px", color: "#374151" }}><strong>Percentage:</strong> {selectedApp.percentage || "N/A"}%</p>
                <p style={{ marginBottom: "5px", color: "#374151" }}><strong>Exam Rank:</strong> {selectedApp.examRank || "N/A"}</p>
              </div>
            </div>

            {/* STEP 1: Document Verification */}
            <div style={{ marginBottom: "25px", padding: "15px", background: selectedApp.officer_verified ? "#dcfce7" : "#fef3c7", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px", color: "#111827" }}>
                STEP 1: Document Verification {selectedApp.officer_verified ? "✅" : "⏳"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "15px" }}>
                {[
                  { label: "Photo", path: selectedApp.photo_path },
                  { label: "Signature", path: selectedApp.signature_path },
                  { label: "10th Marksheet", path: selectedApp.marksheet10_path },
                  { label: "12th Marksheet", path: selectedApp.marksheet12_path },
                  { label: "Entrance Card", path: selectedApp.entranceCard_path },
                  { label: "ID Proof", path: selectedApp.idProof_path }
                ].map((doc, idx) => (
                  <div key={idx} style={{ padding: "10px", background: "white", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>{doc.label}</span>
                    {doc.path ? (
                      <a href={`http://localhost:5000${doc.path}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "14px" }}>View</a>
                    ) : (
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>Missing</span>
                    )}
                  </div>
                ))}
              </div>
              {selectedApp.selection_status !== "rejected" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => verifyDocuments(selectedApp.id, true)} 
                    disabled={selectedApp.officer_verified === 1}
                    style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", opacity: selectedApp.officer_verified === 1 ? 0.5 : 1 }}
                  >
                    ✓ Verify All Documents
                  </button>
                  <button 
                    onClick={() => verifyDocuments(selectedApp.id, false)} 
                    style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                  >
                    ✗ Reject Documents (Auto-Reject Student)
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: Request Additional Documents */}
            {selectedApp.selection_status !== "rejected" && (
              <div style={{ marginBottom: "25px", padding: "15px", background: "#fef3c7", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px", color: "#111827" }}>STEP 2: Request Additional Documents (Optional)</h3>
                <textarea value={documentRequest} onChange={(e) => setDocumentRequest(e.target.value)} placeholder="Specify which documents are needed or corrections required..." style={{ width: "100%", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", minHeight: "80px", marginBottom: "10px", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" }} />
                <button onClick={() => requestDocuments(selectedApp.id)} style={{ padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                  📨 Send Request to Student
                </button>
              </div>
            )}
            {/* Bulk Interview Modal */}
            {showInterviewModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setShowInterviewModal(false)}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "12px", padding: "30px", maxWidth: "500px", width: "100%" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px", color: "#111827" }}>
                    📅 Schedule Bulk Interviews by Department
                  </h2>
                </div>
              </div>
            )}
            {selectedApp.interview_date && (
            
              <div style={{ marginBottom: "25px", padding: "15px", background: "#d02741", borderRadius: "8px" }}>
                
                ✅ Interview scheduled for: {new Date(selectedApp.interview_date).toLocaleString()}
              </div>
            )}


            {/* STEP 4: Final Selection */}
            {selectedApp.selection_status !== "rejected" && (
              <div style={{ marginBottom: "25px", padding: "15px", background: selectedApp.selection_status ? "#dcfce7" : "#fee2e2", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px", color: "#111827" }}>
                  STEP 4: Final Selection Decision {selectedApp.selection_status ? "✅" : "⚠️"}
                </h3>
                {(!selectedApp.officer_verified || !selectedApp.interview_date) && (
                  <p style={{ marginBottom: "15px", color: "#dc2626", fontSize: "14px", fontWeight: "500" }}>
                    ⚠️ Complete Steps 1 and 3 before making final decision
                  </p>
                )}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => updateSelectionStatus(selectedApp.id, "selected")} style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                    ✅ Select
                  </button>
                  <button onClick={() => updateSelectionStatus(selectedApp.id, "waitlisted")} style={{ padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                    ⏳ Waitlist
                  </button>
                  <button onClick={() => updateSelectionStatus(selectedApp.id, "rejected")} style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", width: "100%", fontWeight: "500" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;