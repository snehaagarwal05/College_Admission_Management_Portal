
import React, { useEffect, useState } from "react";
import "./IssueAdmissionLetter.css";
import API_BASE_URL from '../../config';
const IssueAdmissionLetter = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

  // Load APPROVED students
  useEffect(() => {
    fetch("${API_BASE_URL}/api/applications")
      .then((res) => res.json())
      .then((data) => setStudents(data.filter((s) => s.selection_status === "selected")));
  }, []);

  // ===================== TXT LETTER DOWNLOAD (existing) =====================
  const generateTXT = () => {
    if (!selected) return alert("Select a student first!");

    const letter = `
TIE COLLEGE
------------------------------

Dear ${selected.student_name},

Congratulations! We are pleased to inform you that you have been 
granted admission to the course:

Course: ${selected.course_name}

Please report to the college office with all original documents 
for final verification.

Best Regards,
Admission Office
TIE College
`;

    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.student_name}_Admission_Letter.txt`;
    a.click();
  };


  const downloadOfficialPDF = () => {
    if (!selected) return alert("Select a student first!");

    const pdfUrl = `${API_BASE_URL}/api/officer/admission-letter/${selected.id}`;

    window.open(pdfUrl, "_blank"); // open in new tab
  };

  return (
    <div className="letter-container">
      <h1 className="letter-title">📄 Issue Admission Letter</h1>
      <p className="letter-subtitle">
        Generate official admission letters for selected students
      </p>

      <div className="letter-grid">
        
        {/* ---------------- LEFT SIDE: STUDENT LIST ---------------- */}
        <div className="student-select">
          <h3>Selected Students</h3>
          <ul>
            {students.map((s) => (
              <li
                key={s.id}
                onClick={() => setSelected(s)}
                className={selected?.id === s.id ? "active" : ""}
              >
                {s.student_name} ({s.course_name})
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- RIGHT SIDE: PREVIEW + BUTTONS ---------------- */}
        <div className="letter-preview">
          <h3>Letter Preview</h3>

          {selected ? (
            <pre className="letter-box">
Dear {selected.student_name},

Congratulations! You have been selected for
the course: {selected.course_name}.

Please visit the college for further steps.

— Admission Office, TIE College
            </pre>
          ) : (
            <p>Select a student to preview</p>
          )}

          {/* Existing TXT file download */}
          <button className="generate-btn" onClick={generateTXT}>
            📥 Download TXT Letter
          </button>

          {/* New Official PDF download */}
          <button className="generate-btn official" onClick={downloadOfficialPDF}>
            📄 Download Official PDF Letter
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueAdmissionLetter;
