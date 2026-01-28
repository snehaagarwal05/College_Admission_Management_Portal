import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdmissionForm.css";

const AdmissionForm = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);

  const defaultData = {
    fullName: "Rajkumar Singh",
    email: "rajesh.kumar@example.com",
    phone: "9876543210",
    dob: "2005-05-15",
    gender: "Male",
    category: "General",
    address: "123, Park Street, Lake Gardens",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700045",
    coursePreference1: "",
    coursePreference2: "",
    coursePreference3: "",
    qualification: "10+2",
    percentage: "85.5%",
    examName: "JEE Main",
    examRank: "2500",
    guardianName: "Mr. Ramesh Singh",
    guardianPhone: "9876543211",
    guardianRelation: "Father",
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    category: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    coursePreference1: "",
    coursePreference2: "",
    coursePreference3: "",
    qualification: "",
    percentage: "",
    examName: "",
    examRank: "",
    photo: null,
    signature: null,
    marksheet10: null,
    marksheet12: null,
    entranceCard: null,
    idProof: null,
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      alert("Could not load courses from server. Please try again later.");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchDrafts = async () => {
    if (!formData.email) {
      alert("Please enter your email first to view drafts");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/applications/drafts/${formData.email}`);
      const data = await res.json();
      setSavedDrafts(data);
      setShowDrafts(true);
    } catch (err) {
      console.error("Error fetching drafts:", err);
      alert("Failed to load drafts");
    }
  };

  const loadDraft = (draft) => {
    setFormData({
      fullName: draft.student_name || "",
      email: draft.email || "",
      phone: draft.phone || "",
      dob: draft.dob ? draft.dob.split('T')[0] : "",
      gender: draft.gender || "",
      category: draft.category || "",
      address: draft.address || "",
      city: draft.city || "",
      state: draft.state || "",
      pincode: draft.pincode || "",
      coursePreference1: draft.course_preference_1 || "",
      coursePreference2: draft.course_preference_2 || "",
      coursePreference3: draft.course_preference_3 || "",
      qualification: draft.qualification || "",
      percentage: draft.percentage || "",
      examName: draft.examName || "",
      examRank: draft.examRank || "",
      guardianName: draft.guardianName || "",
      guardianPhone: draft.guardianPhone || "",
      guardianRelation: draft.guardianRelation || "",
      photo: null,
      signature: null,
      marksheet10: null,
      marksheet12: null,
      entranceCard: null,
      idProof: null,
    });
    setShowDrafts(false);
    alert("Draft loaded! Please upload documents and submit.");
  };

  const createDummyFile = (name, type = "image/jpeg") => {
    const blob = new Blob(["dummy"], { type });
    return new File([blob], name, { type });
  };

  const handleAutoFill = () => {
    if (!autoFillEnabled) {
      // ✅ FIXED: Only select courses with available seats
      const availableCourses = courses.filter(c => c.available_seats > 0);
      
      const filledData = {
        ...defaultData,
        coursePreference1: availableCourses.length > 0 ? availableCourses[0].id : "",
        coursePreference2: availableCourses.length > 1 ? availableCourses[1].id : "",
        coursePreference3: availableCourses.length > 2 ? availableCourses[2].id : "",
        photo: createDummyFile("demo_photo.jpg"),
        signature: createDummyFile("demo_signature.jpg"),
        marksheet10: createDummyFile("demo_10th_marksheet.pdf", "application/pdf"),
        marksheet12: createDummyFile("demo_12th_marksheet.pdf", "application/pdf"),
        entranceCard: createDummyFile("demo_entrance_card.pdf", "application/pdf"),
        idProof: createDummyFile("demo_aadhar.pdf", "application/pdf"),
      };
      
      setFormData((prev) => ({ ...prev, ...filledData }));
      setUploadedFiles({
        photo: "demo_photo.jpg",
        signature: "demo_signature.jpg",
        marksheet10: "demo_10th_marksheet.pdf",
        marksheet12: "demo_12th_marksheet.pdf",
        entranceCard: "demo_entrance_card.pdf",
        idProof: "demo_aadhar.pdf",
      });
      setAutoFillEnabled(true);
    } else {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        category: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        coursePreference1: "",
        coursePreference2: "",
        coursePreference3: "",
        qualification: "",
        percentage: "",
        examName: "",
        examRank: "",
        photo: null,
        signature: null,
        marksheet10: null,
        marksheet12: null,
        entranceCard: null,
        idProof: null,
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
      });
      setUploadedFiles({});
      setAutoFillEnabled(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setUploadedFiles((prev) => ({ ...prev, [name]: file.name }));
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.email) {
      alert("Please enter your email to save draft");
      return;
    }

    if (!formData.coursePreference1) {
      alert("Please select at least your first course preference");
      return;
    }

    setIsSavingDraft(true);

    try {
      const fd = new FormData();
      fd.append("student_name", formData.fullName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("dob", formData.dob);
      fd.append("gender", formData.gender);
      fd.append("category", formData.category);
      fd.append("address", formData.address);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("pincode", formData.pincode);
      fd.append("course_preference_1", formData.coursePreference1);
      fd.append("course_preference_2", formData.coursePreference2 || "");
      fd.append("course_preference_3", formData.coursePreference3 || "");
      fd.append("qualification", formData.qualification);
      fd.append("percentage", formData.percentage);
      fd.append("examName", formData.examName);
      fd.append("examRank", formData.examRank);
      fd.append("guardianName", formData.guardianName);
      fd.append("guardianPhone", formData.guardianPhone);
      fd.append("guardianRelation", formData.guardianRelation);

      if (formData.photo) fd.append("photo", formData.photo);
      if (formData.signature) fd.append("signature", formData.signature);
      if (formData.marksheet10) fd.append("marksheet10", formData.marksheet10);
      if (formData.marksheet12) fd.append("marksheet12", formData.marksheet12);
      if (formData.entranceCard) fd.append("entranceCard", formData.entranceCard);
      if (formData.idProof) fd.append("idProof", formData.idProof);

      const res = await fetch("http://localhost:5000/api/applications/draft", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Draft saved successfully! You can continue later.");
      } else {
        alert("❌ Failed to save draft: " + data.error);
      }
    } catch (err) {
      console.error("Save draft error:", err);
      alert("❌ Something went wrong while saving draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || formData.fullName.trim() === "") {
      alert("Please enter your full name");
      return;
    }

    if (!formData.email || formData.email.trim() === "") {
      alert("Please enter your email");
      return;
    }

    if (!formData.coursePreference1) {
      alert("Please select at least your first course preference");
      return;
    }

    // ✅ NEW: Validate selected course has available seats
    const selectedCourse = courses.find(c => c.id === parseInt(formData.coursePreference1));
    if (selectedCourse && selectedCourse.available_seats <= 0) {
      alert("❌ The selected course has no available seats. Please choose another course.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      
      // Personal Information
      fd.append("student_name", formData.fullName.trim());
      fd.append("email", formData.email.trim());
      fd.append("phone", formData.phone || "");
      fd.append("dob", formData.dob || "");
      fd.append("gender", formData.gender || "");
      fd.append("category", formData.category || "");
      
      // Address Information
      fd.append("address", formData.address || "");
      fd.append("city", formData.city || "");
      fd.append("state", formData.state || "");
      fd.append("pincode", formData.pincode || "");
      
      // Course Preferences
      fd.append("course_preference_1", formData.coursePreference1);
      fd.append("course_preference_2", formData.coursePreference2 || "");
      fd.append("course_preference_3", formData.coursePreference3 || "");
      
      // Academic Information
      fd.append("qualification", formData.qualification || "");
      fd.append("percentage", formData.percentage || "");
      fd.append("examName", formData.examName || "");
      fd.append("examRank", formData.examRank || "");
      
      // Guardian Information
      fd.append("guardianName", formData.guardianName || "");
      fd.append("guardianPhone", formData.guardianPhone || "");
      fd.append("guardianRelation", formData.guardianRelation || "");

      // Document Files
      if (formData.photo && formData.photo instanceof File) {
        fd.append("photo", formData.photo);
      }
      if (formData.signature && formData.signature instanceof File) {
        fd.append("signature", formData.signature);
      }
      if (formData.marksheet10 && formData.marksheet10 instanceof File) {
        fd.append("marksheet10", formData.marksheet10);
      }
      if (formData.marksheet12 && formData.marksheet12 instanceof File) {
        fd.append("marksheet12", formData.marksheet12);
      }
      if (formData.entranceCard && formData.entranceCard instanceof File) {
        fd.append("entranceCard", formData.entranceCard);
      }
      if (formData.idProof && formData.idProof instanceof File) {
        fd.append("idProof", formData.idProof);
      }

      console.log("=== FORM DATA BEING SENT ===");
      console.log("Student Name:", formData.fullName);
      console.log("Email:", formData.email);
      console.log("Course Preference 1:", formData.coursePreference1);

      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Submit error response:", data);
        alert("❌ Failed to submit application: " + (data.error || "Unknown error"));
        setIsSubmitting(false);
        return;
      }

      console.log("✅ Success response:", data);

      // Store user data in localStorage for auto-login
      const userData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        applicationId: data.applicationId,
        role: "student"
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Show success message
      alert(
        `✅ Application submitted successfully!\n\n` +
        `Your Application ID: ${data.applicationId}\n\n` +
        `You will now be redirected to your student dashboard.`
      );
      
      // Redirect to student dashboard
      navigate("/student-dashboard");
      
    } catch (err) {
      console.error("Network/other error:", err);
      alert("❌ Something went wrong while submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ✅ NEW: Filter courses with available seats
  const availableCourses = courses.filter(c => c.available_seats > 0);
  const hasNoAvailableSeats = courses.length > 0 && availableCourses.length === 0;

  return (
    <div className="application-form-container">
      <div className="form-header">
        <h1>🎓 Admission Application Form</h1>
        <p>Fill in all the required details carefully</p>
        
        {/* ✅ NEW: Warning if no seats available */}
        {hasNoAvailableSeats && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '15px',
            color: '#991b1b'
          }}>
            <strong>⚠️ Notice:</strong> All courses are currently full. No seats are available for admission at this time. Please check back later or contact the admission office.
          </div>
        )}
        
        <div className="autofill-toggle">
          <button
            type="button"
            className={`btn-autofill ${autoFillEnabled ? "active" : ""}`}
            onClick={handleAutoFill}
            disabled={isLoadingCourses || hasNoAvailableSeats}
          >
            {autoFillEnabled ? "🔄 Clear Form" : "⚡ Auto-fill Demo Data"}
          </button>

          <button
            type="button"
            className="btn-load-draft"
            onClick={fetchDrafts}
          >
            📂 Load Saved Draft
          </button>

          {autoFillEnabled && (
            <span className="autofill-notice">
              ✓ Form filled with demo data - You can edit any field
            </span>
          )}
        </div>
      </div>

      {/* Drafts Modal */}
      {showDrafts && (
        <div className="modal-overlay" onClick={() => setShowDrafts(false)}>
          <div className="drafts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📂 Your Saved Drafts</h2>
              <button className="btn-close-modal" onClick={() => setShowDrafts(false)}>✖</button>
            </div>
            <div className="drafts-list">
              {savedDrafts.length === 0 ? (
                <p className="no-drafts">No saved drafts found</p>
              ) : (
                savedDrafts.map((draft) => (
                  <div key={draft.id} className="draft-item">
                    <div className="draft-info">
                      <h3>{draft.student_name}</h3>
                      <p>Saved: {new Date(draft.created_at).toLocaleString()}</p>
                    </div>
                    <button className="btn-load" onClick={() => loadDraft(draft)}>
                      Load Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="application-form">
        {/* Personal Information */}
        <section className="form-section">
          <h2>👤 Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>
        </section>

        {/* Address Information */}
        <section className="form-section">
          <h2>🏠 Address Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Complete Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" placeholder="House No., Street, Locality" />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City" />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State" />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[0-9]{6}" placeholder="6-digit pincode" />
            </div>
          </div>
        </section>

        {/* ✅ FIXED: Course Preferences with Seat Availability */}
        <section className="form-section course-preferences">
          <h2>🎯 Select your Course</h2>
          {hasNoAvailableSeats && (
            <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '10px' }}>
              ❌ All courses are currently full. Applications cannot be submitted at this time.
            </p>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>1st Preference (Primary Choice) *</label>
              <select 
                name="coursePreference1" 
                value={formData.coursePreference1} 
                onChange={handleChange} 
                required 
                disabled={isLoadingCourses || hasNoAvailableSeats}
              >
                <option value="">
                  {isLoadingCourses ? "Loading..." : hasNoAvailableSeats ? "No seats available" : "Select Course"}
                </option>
                {courses.map((c) => (
                  <option 
                    key={c.id} 
                    value={c.id}
                    disabled={c.available_seats <= 0}
                    style={{ 
                      color: c.available_seats <= 0 ? '#9ca3af' : 'inherit',
                      fontStyle: c.available_seats <= 0 ? 'italic' : 'normal'
                    }}
                  >
                    {c.name} - {c.available_seats > 0 ? `Available: ${c.available_seats}/${c.total_seats}` : '🔴 SEATS FULL'}
                  </option>
                ))}
              </select>
              {formData.coursePreference1 && (
                <small style={{ display: 'block', marginTop: '5px', color: '#6b7280' }}>
                  {(() => {
                    const selected = courses.find(c => c.id === parseInt(formData.coursePreference1));
                    return selected ? (
                      selected.available_seats > 0 
                        ? `✅ ${selected.available_seats} seats available` 
                        : '❌ This course is full - please select another'
                    ) : '';
                  })()}
                </small>
              )}
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="form-section">
          <h2>📚 Academic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Highest Qualification *</label>
              <select name="qualification" value={formData.qualification} onChange={handleChange} required>
                <option value="">Select Qualification</option>
                <option value="10+2">10+2 / Intermediate</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
              </select>
            </div>
            <div className="form-group">
              <label>Percentage/CGPA *</label>
              <input type="text" name="percentage" value={formData.percentage} onChange={handleChange} required placeholder="e.g., 85% or 8.5 CGPA" />
            </div>
            <div className="form-group">
              <label>Entrance Exam Name *</label>
              <input type="text" name="examName" value={formData.examName} onChange={handleChange} required placeholder="e.g., JEE Main, WBJEE, CAT" />
            </div>
            <div className="form-group">
              <label>Entrance Exam Rank *</label>
              <input type="text" name="examRank" value={formData.examRank} onChange={handleChange} required placeholder="Your rank in entrance exam" />
            </div>
          </div>
        </section>

        {/* Document Upload */}
        <section className="form-section">
          <h2>📄 Document Upload</h2>
          <p className="document-note">
            Please upload clear scanned copies (PDF/JPG, Max 2MB each)
            {autoFillEnabled && <span className="demo-text"> ✓ Demo files auto-filled (dummy placeholders for testing)</span>}
          </p>
          <div className="form-grid">
            {["photo", "signature", "marksheet10", "marksheet12", "entranceCard", "idProof"].map((field) => {
              const labels = {
                photo: "Passport Size Photo",
                signature: "Signature",
                marksheet10: "10th Marksheet",
                marksheet12: "12th/Graduation Marksheet",
                entranceCard: "Entrance Exam Scorecard",
                idProof: "ID Proof (Aadhar/PAN)"
              };
              return (
                <div key={field} className="form-group">
                  <label>{labels[field]} *</label>
                  {uploadedFiles[field] && autoFillEnabled ? (
                    <div className="file-uploaded-box">
                      <span className="file-icon">📄</span>
                      <span className="file-name-display">{uploadedFiles[field]}</span>
                      <button type="button" className="btn-change-file" onClick={() => {
                        setFormData(prev => ({ ...prev, [field]: null }));
                        setUploadedFiles(prev => ({ ...prev, [field]: null }));
                      }}>Change</button>
                    </div>
                  ) : (
                    <>
                      <input type="file" name={field} onChange={handleFileChange} accept={field.includes("marksheet") || field.includes("Card") || field.includes("Proof") ? ".pdf,image/*" : "image/*"} required={!formData[field]} />
                      {uploadedFiles[field] && <span className="file-name">✓ {uploadedFiles[field]}</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Guardian Information */}
        <section className="form-section">
          <h2>👨‍👩‍👧 Guardian Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Guardian Name *</label>
              <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} required placeholder="Parent/Guardian name" />
            </div>
            <div className="form-group">
              <label>Guardian Phone *</label>
              <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label>Relationship *</label>
              <select name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} required>
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
              </select>
            </div>
          </div>
        </section>

        {/* Declaration */}
        <section className="form-section">
          <div className="declaration">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of my application.</span>
            </label>
          </div>
        </section>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/admission")}>Cancel</button>
          <button 
            type="button" 
            className="btn-save-draft" 
            onClick={handleSaveDraft} 
            disabled={isSavingDraft || hasNoAvailableSeats}
          >
            {isSavingDraft ? "💾 Saving..." : "💾 Save as Draft"}
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={isSubmitting || hasNoAvailableSeats}
          >
            {isSubmitting ? "⏳ Submitting..." : "✅ Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionForm;