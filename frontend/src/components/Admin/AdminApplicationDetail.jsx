import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminApplications.css";

const AdminApplicationDetail = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingDocs, setUpdatingDocs] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);

  const navigate = useNavigate();

  // Load application details
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/applications/${id}`);
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to load application");
          navigate("/admin/applications");
          return;
        }

        setApplication(data);
        setInterviewDate(
          data.interview_date ? data.interview_date.slice(0, 10) : ""
        );
      } catch (err) {
        console.error(err);
        alert("Error loading application details");
        navigate("/admin/applications");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  /* ------------------- UPDATE STATUS (APPROVE / REJECT) ------------------- */

  const updateStatus = async (newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this application as ${newStatus.toUpperCase()}?`
      )
    ) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update status");
        return;
      }

      setApplication((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Network error while updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* -------------------- ADMIN DOCUMENT VERIFICATION ---------------------- */

  const updateDocsVerified = async (verified) => {
    if (
      !window.confirm(
        `Mark documents as ${verified ? "VERIFIED" : "NOT verified"} (Admin)?`
      )
    ) {
      return;
    }

    setUpdatingDocs(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${id}/verification`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || "Failed to update document verification");
        return;
      }

      // update local state
      setApplication((prev) => ({
        ...prev,
        admin_verified: verified ? 1 : 0,
        documents_verified: data.documents_verified,
      }));
    } catch (err) {
      console.error(err);
      alert("Network error while updating document verification");
    } finally {
      setUpdatingDocs(false);
    }
  };

  /* ------------------------ INTERVIEW DATE SAVE -------------------------- */

  const saveInterviewDate = async () => {
    setSavingInterview(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/${id}/interview-date`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interview_date: interviewDate }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save interview / exam date");
        return;
      }

      alert("Interview / exam date saved");
    } catch (err) {
      console.error(err);
      alert("Network error while saving interview date");
    } finally {
      setSavingInterview(false);
    }
  };

  /* ------------------------------ RENDER -------------------------------- */

  if (loading) {
    return (
      <div className="admin-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="admin-container">
      <button className="btn-small pending" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Application #{application.id}</h1>

      {/* Student Information */}
      <div className="detail-card">
        <h2>Student Information</h2>
        <p>
          <strong>Name:</strong> {application.student_name}
        </p>
        <p>
          <strong>Email:</strong> {application.email}
        </p>
        <p>
          <strong>Phone:</strong> {application.phone}
        </p>
        <p>
          <strong>Course:</strong> {application.course_name}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status ${application.status}`}>
            {application.status}
          </span>
        </p>
        <p>
          <strong>Submitted:</strong>{" "}
          {new Date(application.created_at).toLocaleString()}
        </p>
      </div>

      {/* Admin decision + verification */}
      <div className="detail-card">
        <h2>Admin Decision & Verification</h2>

        <div className="button-row">
          <button
            className="btn-small approve"
            disabled={updatingStatus}
            onClick={() => updateStatus("approved")}
          >
            ✅ Approve
          </button>
          <button
            className="btn-small reject"
            disabled={updatingStatus}
            onClick={() => updateStatus("rejected")}
          >
            ❌ Reject
          </button>
        </div>

        <p style={{ marginTop: "1rem" }}>
          <strong>Admin Document Verification:</strong>{" "}
          {application.admin_verified ? "✅ Verified" : "❌ Not Verified"}
        </p>

        <div className="button-row">
          <button
            className="btn-small verify"
            disabled={updatingDocs}
            onClick={() => updateDocsVerified(true)}
          >
            Mark as Verified
          </button>
          <button
            className="btn-small unverify"
            disabled={updatingDocs}
            onClick={() => updateDocsVerified(false)}
          >
            Mark as Not Verified
          </button>
        </div>

        <p style={{ marginTop: "0.5rem" }}>
          <strong>Final Documents Verified (Admin + Faculty):</strong>{" "}
          {application.documents_verified ? "✅ Yes" : "❌ No"}
        </p>
      </div>

      {/* Interview / Entrance Exam section */}
      <div className="detail-card">
        <h2>Interview / Entrance Exam</h2>
        <div className="form-row">
          <label>
            Interview / Exam Date:{" "}
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </label>
          <button
            className="btn-small approve"
            disabled={savingInterview}
            onClick={saveInterviewDate}
          >
            💾 Save Date
          </button>
        </div>
        {application.interview_date && (
          <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
            Currently stored date:&nbsp;
            {new Date(application.interview_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Uploaded documents */}
      <div className="detail-card">
        <h2>Uploaded Documents</h2>
        <ul>
          <li>
            Photo:{" "}
            {application.photo_path ? (
              <a
                href={`http://localhost:5000${application.photo_path}`}
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
            Signature:{" "}
            {application.signature_path ? (
              <a
                href={`http://localhost:5000${application.signature_path}`}
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
            10th Marksheet:{" "}
            {application.marksheet10_path ? (
              <a
                href={`http://localhost:5000${application.marksheet10_path}`}
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
            12th / Graduation Marksheet:{" "}
            {application.marksheet12_path ? (
              <a
                href={`http://localhost:5000${application.marksheet12_path}`}
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
            Entrance Exam Scorecard:{" "}
            {application.entranceCard_path ? (
              <a
                href={`http://localhost:5000${application.entranceCard_path}`}
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
            ID Proof:{" "}
            {application.idProof_path ? (
              <a
                href={`http://localhost:5000${application.idProof_path}`}
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

        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
          (Students see their document status and interview / exam date on their
          profile.)
        </p>
      </div>
    </div>
  );
};

export default AdminApplicationDetail;
