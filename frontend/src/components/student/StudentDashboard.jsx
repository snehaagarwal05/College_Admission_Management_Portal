import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    submitted: 0,
    approved: 0,
    selected: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    
    if (!parsedUser.email) {
      navigate("/login");
      return;
    }
    
    setUser(parsedUser);
    fetchDashboardData(parsedUser.email);
  }, []);

  const fetchDashboardData = async (email) => {
    try {
      setLoading(true);
      
      const res = await fetch(`http://localhost:5000/api/student/dashboard/${email}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard");
      }
      
      const data = await res.json();
      
      if (data.applications && data.applications.length > 0) {
        setApplications(data.applications);
        setAdditionalDocs(data.additionalDocuments || []);
        setStats(data.stats || {});
        setError("");
      } else {
        setError("No application found. Please submit your application first.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load your application data");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handlePay = (applicationId) => {
    navigate(`/payment?appId=${applicationId}`);
  };

  const uploadAdditionalDocument = async (docId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:5000/api/additional-documents/${docId}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (res.ok) {
        alert("Document uploaded successfully!");
        if (user?.email) {
          fetchDashboardData(user.email);
        }
      } else {
        alert("Failed to upload document");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>{error}</h2>
        <button onClick={() => navigate("/admissionPage")} className="submit-app-btn">
          Submit Application
        </button>
      </div>
    );
  }

  const primaryApp = applications.find(app => app.is_draft === 0) || applications[0];

  if (!primaryApp) {
    return (
      <div className="dashboard-error">
        <h2>No application found</h2>
        <button onClick={() => navigate("/admissionPage")} className="submit-app-btn">
          Submit Application
        </button>
      </div>
    );
  }

  const formFilled = true;
  const documentsUploaded = primaryApp && (
    primaryApp.photo_path || 
    primaryApp.marksheet10_path || 
    primaryApp.marksheet12_path
  );
  const paymentDone = primaryApp?.payment_status === "paid";
  const documentsVerified = primaryApp?.officer_verified === 1;
  const documentsRejected = primaryApp?.officer_verified === 0 && primaryApp?.selection_status === "rejected";
  const interviewScheduled = primaryApp?.interview_date !== null;
  const isSelected = primaryApp?.selection_status === "selected";
  const isRejected = primaryApp?.selection_status === "rejected";
  const isWaitlisted = primaryApp?.selection_status === "waitlisted";
  const isApproved = primaryApp?.status === "approved";

  const stepsStatus = [
    true,                 // Register
    formFilled,
    documentsUploaded,
    isApproved,
    documentsVerified,
    interviewScheduled,
    isSelected || isWaitlisted || isRejected,
    paymentDone
  ];

  const completedSteps = stepsStatus.filter(Boolean).length;
  const totalSteps = stepsStatus.length;
  const progressHeight = `${(completedSteps / totalSteps) * 100}%`;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>🎓 Welcome, {user?.name || "Student"}</h2>
        <p>Track your admission journey</p>
      </div>

      {/* Rejection Alert - Documents Rejected */}
      {documentsRejected && (
        <div className="alert-box alert-error">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <h3>Application Rejected - Documents Not Verified</h3>
            <p>
              Unfortunately, your submitted documents could not be verified by the admission officer. 
              Your application has been rejected and the admission process has ended.
            </p>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#7f1d1d' }}>
              <strong>Reason:</strong> Document verification failed. Please contact the admission office for more details.
            </p>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Admission Letter Alert - Now INSIDE the return statement */}
      {isSelected && paymentDone && primaryApp?.admission_letter_path && (
        <div className="alert-box alert-info">
          <div className="alert-icon">📄</div>
          <div className="alert-content">
            <h3>🎉 Admission Letter Available!</h3>
            <p>Congratulations! Your admission letter is ready for download.</p>
            <a
              href={`http://localhost:5000${primaryApp.admission_letter_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pay-btn-small"
              style={{ 
                display: 'inline-block', 
                marginTop: '10px',
                padding: '10px 20px',
                background: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              ⬇️ Download Admission Letter
            </a>
          </div>
        </div>
      )}

      {/* Selection Status Alerts */}
      {isSelected && !documentsRejected && (
        <div className="alert-box alert-success">
          <div className="alert-icon">🎉</div>
          <div className="alert-content">
            <h3>Congratulations! You Have Been Selected!</h3>
            <p>Your application has been approved. Please complete the payment to confirm your admission.</p>
          </div>
        </div>
      )}

      {isWaitlisted && !documentsRejected && (
        <div className="alert-box alert-warning">
          <div className="alert-icon">⏳</div>
          <div className="alert-content">
            <h3>You're on the Waitlist</h3>
            <p>Your application is on the waitlist. We'll notify you if a seat becomes available.</p>
          </div>
        </div>
      )}

      {isRejected && !documentsRejected && (
        <div className="alert-box alert-error">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <h3>Application Not Selected</h3>
            <p>Unfortunately, your application was not selected in this admission cycle.</p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="progress-section">
        <h3>Your Admission Progress</h3>
        
        <div
          className="progress-steps"
          style={{ "--progress-height": progressHeight }}
        >
          <Step label="1. Register" checked={true} />
          <Step label="2. Form Fill-Up" checked={formFilled} />
          <Step label="3. Upload Documents" checked={documentsUploaded} />
          <Step 
            label="4. Admin Approval" 
            checked={isApproved}
            extra={isApproved && (
              <div className="approval-info">
                ✅ Your application has been approved by admin
              </div>
            )}
          />
          <Step 
            label="5. Document Verification" 
            checked={documentsVerified}
            failed={documentsRejected}
            extra={
              documentsVerified ? (
                <div className="verification-info">
                  ✅ Documents verified by officer
                </div>
              ) : documentsRejected ? (
                <div className="verification-failed">
                  ❌ Documents rejected - Application terminated
                </div>
              ) : null
            }
          />
          
          {/* Only show remaining steps if documents weren't rejected */}
          {!documentsRejected && (
            <>
              <Step 
                label="6. Interview Scheduled" 
                checked={interviewScheduled}
                extra={interviewScheduled && (
                  <div className="interview-info">
                    📅 Interview Date: {new Date(primaryApp.interview_date).toLocaleDateString()}
                  </div>
                )}
              />
              <Step 
                label="7. Selection Status" 
                checked={isSelected || isWaitlisted || isRejected}
                extra={
                  <div className="selection-status">
                    {isSelected && (
                      <span className="badge badge-selected">
                        🎉 Congratulations! You're selected
                      </span>
                    )}
                    {isWaitlisted && (
                      <span className="badge badge-waitlisted">
                        ⏳ You're on the waitlist
                      </span>
                    )}
                    {isRejected && (
                      <span className="badge badge-rejected">
                        ❌ Application not selected
                      </span>
                    )}
                  </div>
                }
              />
              <Step 
                label="8. Payment" 
                checked={paymentDone}
                extra={
                  <>
                    {!paymentDone && isSelected && (
                      <button onClick={() => handlePay(primaryApp.id)} className="pay-btn-small">
                        💳 Pay Now
                      </button>
                    )}
                    {paymentDone && (
                      <div className="payment-success">
                        ✅ Payment completed successfully
                      </div>
                    )}
                  </>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* All Applications */}
      {applications.length > 1 && (
        <div className="all-applications-section">
          <h3>📋 All Your Applications</h3>
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="application-item">
                <div className="app-info">
                  <span className="app-id">App #{app.id}</span>
                  <span className="app-course">{app.course_name || 'N/A'}</span>
                  <span className={`app-status status-${app.status}`}>
                    {app.status?.toUpperCase()}
                  </span>
                  {app.is_draft === 1 && (
                    <span className="draft-badge">DRAFT</span>
                  )}
                  {app.selection_status === "rejected" && (
                    <span className="rejected-badge">REJECTED</span>
                  )}
                </div>
                <div className="app-date">
                  {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Documents Requested - Hide if rejected */}
      {!documentsRejected && additionalDocs.length > 0 && (
        <div className="additional-docs-section">
          <h3 className="docs-title">📋 Additional Documents Requested</h3>
          {additionalDocs.map((doc) => (
            <div key={doc.id} className="doc-request-card">
              <p className="doc-reason"><strong>Reason:</strong> {doc.reason}</p>
              <p className="doc-date">
                Requested on: {new Date(doc.created_at).toLocaleDateString()}
              </p>
              {doc.status === "requested" ? (
                <div className="doc-upload">
                  <label htmlFor={`file-${doc.id}`} className="upload-label">
                    Choose file to upload
                  </label>
                  <input 
                    type="file" 
                    id={`file-${doc.id}`}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadAdditionalDocument(doc.id, e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="doc-uploaded">
                  ✅ Document uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Documents Section */}
      <div className="documents-section">
        <h3>📄 Your Documents</h3>
        <div className="documents-grid">
          {[
            { label: "Photo", path: primaryApp?.photo_path },
            { label: "Signature", path: primaryApp?.signature_path },
            { label: "10th Marksheet", path: primaryApp?.marksheet10_path },
            { label: "12th Marksheet", path: primaryApp?.marksheet12_path },
            { label: "Entrance Card", path: primaryApp?.entranceCard_path },
            { label: "ID Proof", path: primaryApp?.idProof_path }
          ].map((doc, idx) => (
            <div key={idx} className="document-card">
              <p className="doc-label">{doc.label}</p>
              {doc.path ? (
                <a 
                  href={`http://localhost:5000${doc.path}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="doc-link"
                >
                  View Document →
                </a>
              ) : (
                <span className="doc-not-uploaded">Not uploaded</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

function Step({ label, checked, failed, extra }) {
  return (
    <div className={`step ${failed ? 'step-failed' : ''}`}>
      <div className={`step-indicator ${checked ? "checked" : ""} ${failed ? "failed" : ""}`}>
        {checked && !failed && <span>✓</span>}
        {failed && <span>✗</span>}
      </div>
      <div className="step-content">
        <span className={`step-label ${checked ? "checked" : ""} ${failed ? "failed" : ""}`}>{label}</span>
        {extra}
      </div>
    </div>
  );
}