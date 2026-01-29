import React, { useState } from "react";
import "./StudentApplicationStatus.css";
import API_BASE_URL from "../../config";
const StudentApplicationStatus = () => {
  const [form, setForm] = useState({
    id: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);

  // existing
  const [extraDocs, setExtraDocs] = useState([]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDateTime = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setApplication(null);
    setExtraDocs([]);

    if (!form.id.trim() || !form.email.trim()) {
      setError("Please enter both Application ID and Email.");
      return;
    }

    setLoading(true);
    try {
      // fetch application
      const res = await fetch("${API_BASE_URL}/api/applications/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(form.id),
          email: form.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // save application
      setApplication(data);

      // fetch additional docs
      const docsRes = await fetch(
        `${API_BASE_URL}/api/applications/${data.id}/additional-documents`
      );
      const docsData = await docsRes.json();

      if (docsRes.ok) setExtraDocs(docsData);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-page">
      <div className="status-container">

        {/* Search Card */}
        <div className="status-card">
          <h1 className="status-title">Check Application Status</h1>
          <p className="status-subtitle">
            Enter your <strong>Application ID</strong> and{" "}
            <strong>Email</strong> to view your application details.
          </p>

          <form className="status-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id">Application ID</label>
                <input
                  id="id"
                  name="id"
                  type="number"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="e.g., 6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email used during application</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Checking..." : "View Application"}
            </button>
          </form>
        </div>

        {/* ================= STUDENT APPLICATION RESULT ================= */}
        {application && (
          <div className="status-result-card">
            <div className="result-header">
              <div>
                <p className="result-label">Application ID</p>
                <h2 className="result-app-id">#{application.id}</h2>
              </div>
              <div className="result-status-block">
                <p className="result-label">Current Status</p>
                <span className={`status-pill status-${application.status}`}>
                  {application.status}
                </span>
              </div>
            </div>

            <div className="result-grid">
              <div className="result-section">
                <h3 className="section-title">Applicant Details</h3>
                <p><span className="field-label">Name:</span> {application.student_name}</p>
                <p><span className="field-label">Email:</span> {application.email}</p>
                <p><span className="field-label">Phone:</span> {application.phone || "Not provided"}</p>
                <p><span className="field-label">Course:</span> {application.course_name}</p>
              </div>

              <div className="result-section">
                <h3 className="section-title">Application Summary</h3>
                <p><span className="field-label">Documents Verified:</span> {application.documents_verified ? "✅ Yes" : "❌ No"}</p>
                <p><span className="field-label">Submitted On:</span> {formatDateTime(application.created_at)}</p>
                <p>
                  <span className="field-label">Interview Date:</span>{" "}
                  {application.interview_date
                    ? formatDateTime(application.interview_date)
                    : "Not scheduled yet"}
                </p>
              </div>
            </div>

            <div className="divider" />

            {/* ================= 🔵 NEW SECTION — SELECTION STATUS ================= */}
            <div className="result-section">
              <h3 className="section-title">Admission Decision</h3>

              {application.selection_status ? (
                <p className="selection-status-box">
                  <strong>Final Decision:</strong>{" "}
                  {application.selection_status === "selected" && "🎉 Selected — Congratulations!"}
                  {application.selection_status === "waitlisted" && "⏳ Waitlisted — Please wait for updates."}
                  {application.selection_status === "rejected" && "❌ Not Selected — Try again next year."}
                </p>
              ) : (
                <p className="selection-status-box">
                  Decision Pending — Merit list not released yet.
                </p>
              )}
            </div>
            {/* ====================================================================== */}

            <div className="divider" />

            <div className="result-section">
              <h3 className="section-title">Documents (for your reference)</h3>
              <ul className="doc-list">
                <li>
                  <span>Photo:</span>{" "}
                  {application.photo_path ? (
                    <a
                      href={`${API_BASE_URL}${application.photo_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>

                <li>
                  <span>Signature:</span>{" "}
                  {application.signature_path ? (
                    <a
                      href={`${API_BASE_URL}${application.signature_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>

                <li>
                  <span>10th Marksheet:</span>{" "}
                  {application.marksheet10_path ? (
                    <a
                      href={`http://${API_BASE_URL}:5000${application.marksheet10_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>

                <li>
                  <span>12th Marksheet:</span>{" "}
                  {application.marksheet12_path ? (
                    <a
                      href={`http://${API_BASE_URL}:5000${application.marksheet12_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>

                <li>
                  <span>Entrance Scorecard:</span>{" "}
                  {application.entranceCard_path ? (
                    <a
                      href={`http://${API_BASE_URL}:5000${application.entranceCard_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>

                <li>
                  <span>ID Proof:</span>{" "}
                  {application.idProof_path ? (
                    <a
                      href={`http://${API_BASE_URL}:5000${application.idProof_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Extra document request */}
        {extraDocs.length > 0 && (
          <div className="alert-box">
            <h3>⚠️ Additional Documents Required</h3>
            {extraDocs.map((doc) => (
              <div key={doc.id} className="extra-doc-card">
                <p><strong>Reason:</strong> {doc.reason}</p>
                <p><strong>Status:</strong> {doc.status}</p>

                {doc.status === "requested" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const file = e.target.file.files[0];
                      const formData = new FormData();
                      formData.append("file", file);

                      fetch(
                        `http://${API_BASE_URL}:5000/api/additional-documents/${doc.id}/upload`,
                        {
                          method: "POST",
                          body: formData,
                        }
                      )
                        .then((res) => res.json())
                        .then(() => alert("Document uploaded successfully"));
                    }}
                  >
                    <input type="file" name="file" required />
                    <button type="submit">Upload Document</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApplicationStatus;