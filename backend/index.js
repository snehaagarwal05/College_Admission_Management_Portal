const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const generateReceipt = require("./utils/receiptGenerator");
const generateAdmissionLetter = require("./utils/generateAdmissionLetter");
const reportsRoutes = require('./routes/reports');
const officerRoutes = require('./routes/officer');
dotenv.config();
const app = express();
app.use("/receipts", express.static(path.join(__dirname, "receipts")));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/reports', reportsRoutes);
app.use('/api/officer', officerRoutes);      
app.use('/api/applications', officerRoutes);

// ==================== DATABASE CONNECTION ====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});
app.set('pool', pool);
// ==================== FILE UPLOAD CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "")),
});
const upload = multer({ storage });

// ==================== BASIC ROUTE ====================
app.get("/", (req, res) => res.send("Backend running ✓"));

// ==================== DEBUG ENDPOINTS ====================
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ success: true, dbWorking: true, result: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/test-applications-count", async (req, res) => {
  try {
    const [total] = await pool.query("SELECT COUNT(*) as count FROM applications");
    const [approved] = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'");
    res.json({ 
      total: total[0].count, 
      approved: approved[0].count 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==================== COURSES MANAGEMENT ==================== */

app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.post("/api/courses", async (req, res) => {
  try {
    const { name, department, level, total_seats, eligibility_criteria, course_fees } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO courses (name, department, level, total_seats, available_seats, eligibility_criteria, course_fees)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, department, level, total_seats, total_seats, eligibility_criteria, course_fees]
    );

    res.json({ success: true, courseId: result.insertId });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

app.post("/api/send-admission-letters", async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT id, student_name, course_name 
      FROM applications 
      WHERE selection_status = 'selected'
    `);

    for (const student of students) {
      const pdfPath = generateAdmissionLetter(student);

      await pool.query(
        "UPDATE applications SET admission_letter_path = ? WHERE id = ?",
        [pdfPath, student.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate admission letters" });
  }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, level, total_seats, available_seats, eligibility_criteria, course_fees } = req.body;
    
    await pool.query(
      `UPDATE courses 
       SET name=?, department=?, level=?, total_seats=?, available_seats=?, eligibility_criteria=?, course_fees=?
       WHERE id=?`,
      [name, department, level, total_seats, available_seats, eligibility_criteria, course_fees, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

app.delete("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM courses WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

/* ==================== APPLICATION SUBMISSIONS ==================== */

// Save Draft
app.post("/api/applications/draft", upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "marksheet10", maxCount: 1 },
  { name: "marksheet12", maxCount: 1 },
  { name: "entranceCard", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      student_name, email, phone, dob, gender, category,
      address, city, state, pincode,
      course_preference_1, course_preference_2, course_preference_3,
      qualification, percentage, examName, examRank,
      guardianName, guardianPhone, guardianRelation,
    } = req.body;

    const files = req.files || {};
    const getPath = (f) => (files[f] && files[f][0]) ? "/uploads/" + files[f][0].filename : null;

    const [result] = await pool.query(
      `INSERT INTO applications 
       (student_name, email, phone, dob, gender, category,
        address, city, state, pincode,
        course_preference_1, course_preference_2, course_preference_3,
        qualification, percentage, examName, examRank,
        guardianName, guardianPhone, guardianRelation,
        photo_path, signature_path, marksheet10_path, marksheet12_path,
        entranceCard_path, idProof_path, is_draft, selection_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'none')`,
      [
        student_name || null, email || null, phone || null, dob || null,
        gender || null, category || null, address || null, city || null,
        state || null, pincode || null,
        course_preference_1 || null, course_preference_2 || null, course_preference_3 || null,
        qualification || null, percentage || null, examName || null, examRank || null,
        guardianName || null, guardianPhone || null, guardianRelation || null,
        getPath("photo"), getPath("signature"), getPath("marksheet10"),
        getPath("marksheet12"), getPath("entranceCard"), getPath("idProof"),
      ]
    );

    res.json({ success: true, draftId: result.insertId });
  } catch (err) {
    console.error("Save draft error:", err);
    res.status(500).json({ error: "Failed to save draft: " + err.message });
  }
});

// Get Drafts
app.get("/api/applications/drafts/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM applications WHERE email = ? AND is_draft = 1 ORDER BY created_at DESC",
      [email]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get drafts error:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

// Submit Application
app.post("/api/applications", upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "marksheet10", maxCount: 1 },
  { name: "marksheet12", maxCount: 1 },
  { name: "entranceCard", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      student_name, email, phone, dob, gender, category,
      address, city, state, pincode,
      course_preference_1, course_preference_2, course_preference_3,
      qualification, percentage, examName, examRank,
      guardianName, guardianPhone, guardianRelation,
    } = req.body;

    const files = req.files || {};
    const getPath = (f) => (files[f] && files[f][0]) ? "/uploads/" + files[f][0].filename : null;

    const primaryCourseId = course_preference_1 || null;

    const [result] = await pool.query(
      `INSERT INTO applications 
       (student_name, email, phone, dob, gender, category,
        address, city, state, pincode,
        course_id, course_preference_1, course_preference_2, course_preference_3,
        qualification, percentage, examName, examRank,
        guardianName, guardianPhone, guardianRelation,
        photo_path, signature_path, marksheet10_path, marksheet12_path,
        entranceCard_path, idProof_path, is_draft, selection_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'none')`,
      [
        student_name || null, email || null, phone || null, dob || null,
        gender || null, category || null, address || null, city || null,
        state || null, pincode || null, primaryCourseId,
        course_preference_1 || null, course_preference_2 || null, course_preference_3 || null,
        qualification || null, percentage || null, examName || null, examRank || null,
        guardianName || null, guardianPhone || null, guardianRelation || null,
        getPath("photo"), getPath("signature"), getPath("marksheet10"),
        getPath("marksheet12"), getPath("entranceCard"), getPath("idProof"),
      ]
    );
    const applicationId = result.insertId;
    // Return user data for auto-login
    res.json({ 
      success: true, 
      applicationId: applicationId,
      user: {
        name: student_name,
        email: email,
        applicationId: applicationId
      },
      message: "Application submitted successfully!"
    });
  } catch (err) {
    console.error("Application submission error:", err);
    res.status(500).json({ error: "Submit failed: " + err.message });
  }
});

// Get Single Application
app.get("/api/applications/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.name AS course_name 
       FROM applications a 
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Single fetch error:", err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// Application Lookup (Student)
app.post("/api/applications/lookup", async (req, res) => {
  const { id, email } = req.body;
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.name AS course_name
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.id = ? AND a.email = ? AND a.is_draft = 0`,
      [id, email]
    );
    if (!rows.length) return res.status(404).json({ error: "No match" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Lookup error:", err);
    res.status(500).json({ error: "Network error" });
  }
});

/* ==================== ADMIN ROUTES ==================== */
//Get All Applications (for Admin Dashboard)
app.get("/api/applications", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.*, 
        c.name AS course_name
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.is_draft = 0
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications", details: err.message });
  }
});
// Bulk Schedule Interviews by Department
app.post("/api/officer/bulk-schedule-interview", async (req, res) => {
  try {
    const { department, interviewDate } = req.body;

    if (!department || !interviewDate) {
      return res.status(400).json({ error: "Department and interview date are required" });
    }

    console.log(`[BULK INTERVIEW] Scheduling for department: ${department}`);

    // Get all verified students from the selected department who don't have interviews scheduled
    const [students] = await pool.query(
      `SELECT a.id, a.student_name, c.department 
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.status = 'approved' 
       AND a.officer_verified = 1 
       AND a.interview_date IS NULL
       AND c.department = ?`,
      [department]
    );

    if (students.length === 0) {
      return res.status(400).json({ 
        error: `No verified students found without interviews in ${department} department` 
      });
    }

    // Update all students with the interview date
    const studentIds = students.map(s => s.id);
    const placeholders = studentIds.map(() => '?').join(',');
    
    const [result] = await pool.query(
      `UPDATE applications 
       SET interview_date = ? 
       WHERE id IN (${placeholders})`,
      [interviewDate, ...studentIds]
    );

    console.log(`[BULK INTERVIEW] Scheduled for ${result.affectedRows} students in ${department}`);

    res.json({
      success: true,
      scheduled: result.affectedRows,
      department: department,
      interviewDate: interviewDate,
      students: students.map(s => ({ id: s.id, name: s.student_name }))
    });

  } catch (error) {
    console.error("Bulk interview scheduling error:", error);
    res.status(500).json({ 
      error: "Failed to schedule bulk interviews",
      details: error.message 
    });
  }
});
// Bulk Approve Students
app.post("/api/admin/bulk-approve", async (req, res) => {
  const { studentIds } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'studentIds array is required' });
  }

  try {
    const placeholders = studentIds.map(() => '?').join(',');
    const [result] = await pool.query(
      `UPDATE applications SET status = 'approved' WHERE id IN (${placeholders})`,
      studentIds
    );

    console.log(`[BULK APPROVE] ${result.affectedRows} students approved`);

    res.json({ 
      success: true, 
      message: `${studentIds.length} students approved successfully`,
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error('Bulk approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send Admission Letters (Bulk)

app.post("/api/officer/send-admission-letters", async (req, res) => {
  try {
    // Get all selected students who have paid and don't have admission letters yet
    const [selectedStudents] = await pool.query(`
      SELECT 
        a.id,
        a.student_name,
        a.email,
        c.name as course_name,
        a.admission_letter_path,
        a.payment_status
      FROM applications a
      LEFT JOIN courses c ON a.course_preference_1 = c.id
      WHERE a.selection_status = 'selected'
      AND a.payment_status = 'paid'
      AND (a.admission_letter_path IS NULL OR a.admission_letter_path = '')
    `);

    if (selectedStudents.length === 0) {
      return res.status(400).json({ 
        error: "No students eligible for admission letters. Students must be selected and have paid their fees." 
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // Generate admission letter for each selected student
    for (const student of selectedStudents) {
      try {
        // Generate the PDF
        const letterPath = generateAdmissionLetter(student);

        // Update the database with the letter path
        await pool.query(
          `UPDATE applications 
           SET admission_letter_path = ?, 
               admission_letter_sent_at = NOW() 
           WHERE id = ?`,
          [letterPath, student.id]
        );

        successCount++;
        console.log(`✅ Admission letter generated for ${student.student_name} (ID: ${student.id})`);
      } catch (err) {
        failedCount++;
        errors.push(`Failed for ${student.student_name} (ID: ${student.id}): ${err.message}`);
        console.error(`❌ Error generating letter for ${student.student_name}:`, err);
      }
    }

    // Return summary
    res.json({
      success: true,
      message: `Admission letters processed`,
      stats: {
        total: selectedStudents.length,
        successful: successCount,
        failed: failedCount
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error("Error sending admission letters:", err);
    res.status(500).json({ 
      error: "Failed to send admission letters", 
      details: err.message 
    });
  }
});
/* ==================== STUDENT PORTAL ROUTES ==================== */

// Get Student Dashboard Data
app.get("/api/student/dashboard/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Get all applications for this student
    const [applications] = await pool.query(
      `SELECT 
        a.*,
        c.name as course_name,
        c.department,
        c.level
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.email = ?
       ORDER BY a.created_at DESC`,
      [email]
    );

    if (applications.length === 0) {
      return res.status(404).json({ error: "No applications found" });
    }

    // Get additional documents requested for all applications
    const applicationIds = applications.map(app => app.id);
    const placeholders = applicationIds.map(() => '?').join(',');
    
    const [additionalDocs] = await pool.query(
      `SELECT * FROM additional_documents 
       WHERE application_id IN (${placeholders})
       ORDER BY created_at DESC`,
      applicationIds
    );

    // Calculate stats
    const stats = {
      totalApplications: applications.length,
      drafts: applications.filter(a => a.is_draft === 1).length,
      submitted: applications.filter(a => a.is_draft === 0).length,
      approved: applications.filter(a => a.status === 'approved').length,
      selected: applications.filter(a => a.selection_status === 'selected').length
    };

    res.json({
      student: {
        name: applications[0].student_name,
        email: applications[0].email,
        phone: applications[0].phone
      },
      applications: applications,
      additionalDocuments: additionalDocs,
      stats: stats
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
//Student Login (Application Lookup)
app.post("/api/student/login", async (req, res) => {
  try {
    const { applicationId, email } = req.body;

    if (!applicationId || !email) {
      return res.status(400).json({ error: "Application ID and Email are required" });
    }

    const [apps] = await pool.query(
      `SELECT a.*, c.name AS course_name
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.id = ? AND a.email = ? AND a.is_draft = 0`,
      [applicationId, email]
    );

    if (apps.length === 0) {
      return res.status(404).json({ error: "No application found with this ID and Email combination" });
    }

    const application = apps[0];

    res.json({
      success: true,
      user: {
        name: application.student_name,
        email: application.email,
        applicationId: application.id
      }
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});
// Get Student Application Details
app.get("/api/student/application/:id/:email", async (req, res) => {
  try {
    const { id, email } = req.params;

    const [apps] = await pool.query(
      `SELECT 
        a.*,
        c1.name as course1_name,
        c2.name as course2_name,
        c3.name as course3_name
       FROM applications a
       LEFT JOIN courses c1 ON a.course_preference_1 = c1.id
       LEFT JOIN courses c2 ON a.course_preference_2 = c2.id
       LEFT JOIN courses c3 ON a.course_preference_3 = c3.id
       WHERE a.id = ? AND a.email = ?`,
      [id, email]
    );

    if (apps.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Get additional documents for this application
    const [additionalDocs] = await pool.query(
      "SELECT * FROM additional_documents WHERE application_id = ? ORDER BY created_at DESC",
      [id]
    );

    res.json({
      application: apps[0],
      additionalDocuments: additionalDocs
    });
  } catch (err) {
    console.error("Application fetch error:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Student Login (Application Lookup)

// Get All Applications for Officer Dashboard
app.get("/api/officer/applications", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.*, 
        c.name AS course_name
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.is_draft = 0 AND a.status = 'approved'
       ORDER BY a.id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch officer applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications", details: err.message });
  }
});

// Officer Stats Dashboard
app.get("/api/officer/stats", async (req, res) => {
  try {
    // Use Promise.all to run queries in parallel
    const [
      [eligible],
      [verified],
      [selected],
      [pending]
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved' AND is_draft = 0"),
      pool.query("SELECT COUNT(*) as count FROM applications WHERE officer_verified = 1 AND is_draft = 0"),
      pool.query("SELECT COUNT(*) as count FROM applications WHERE selection_status = 'selected' AND is_draft = 0"),
      pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'approved' AND officer_verified = 0 AND is_draft = 0")
    ]);

    res.json({
      totalEligible: eligible[0].count || 0,
      verifiedDocuments: verified[0].count || 0,
      selectedStudents: selected[0].count || 0,
      pendingReview: pending[0].count || 0
    });
  } catch (err) {
    console.error('Officer stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Officer Document Verification
app.patch("/api/applications/:id/officer-verification", async (req, res) => {
  const { id } = req.params;
  const { officer_verified } = req.body;

  try {
    await pool.query(
      "UPDATE applications SET officer_verified = ? WHERE id = ?",
      [officer_verified ? 1 : 0, id]
    );
    
    console.log(`[OFFICER] Document verification for app ${id}: ${officer_verified ? 'VERIFIED' : 'REJECTED'}`);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Officer verification error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Request Additional Documents
app.post("/api/applications/:id/request-document", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: 'Reason is required' });
  }

  try {
    await pool.query(
      "INSERT INTO additional_documents (application_id, reason, status, created_at) VALUES (?, ?, 'requested', NOW())",
      [id, reason]
    );
    
    console.log(`[OFFICER] Additional document requested for app ${id}`);
    
    res.json({ success: true, message: "Document requested" });
  } catch (err) {
    console.error("Document request error:", err);
    res.status(500).json({ error: "Failed to request document" });
  }
});

// Get Additional Documents
app.get("/api/applications/:id/additional-documents", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM additional_documents WHERE application_id = ? ORDER BY created_at DESC",
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch additional docs error:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Upload Additional Document (Student)
app.post("/api/additional-documents/:docId/upload", upload.single("file"), async (req, res) => {
  const { docId } = req.params;
  if (!req.file) return res.status(400).json({ error: "No file" });
  
  const filePath = `/uploads/${req.file.filename}`;
  try {
    await pool.query(
      "UPDATE additional_documents SET file_path=?, status='uploaded', uploaded_at=NOW() WHERE id=?",
      [filePath, docId]
    );
    res.json({ success: true, message: "Document uploaded" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});
// Add this route to your backend (likely in your applications routes file)
// Schedule Interview
app.patch("/api/applications/:id/interview-date", async (req, res) => {
  const { id } = req.params;
  const { interview_date } = req.body;
  
  if (!interview_date) {
    return res.status(400).json({ error: 'Interview date is required' });
  }

  try {
    await pool.query(
      "UPDATE applications SET interview_date = ? WHERE id = ?", 
      [interview_date, id]
    );
    
    console.log(`[OFFICER] Interview scheduled for app ${id}: ${interview_date}`);
    
    res.json({ success: true });
  } catch (err) {
    console.error("Interview date update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Update Selection Status (with validation and seat management)
app.put("/api/officer/selection/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['selected', 'waitlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Get application details
    const [apps] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
    if (apps.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = apps[0];

    // VALIDATION: Must be approved by admin
    if (application.status !== 'approved') {
      return res.status(400).json({ error: 'Student must be approved by admin first' });
    }

    // VALIDATION: Documents must be verified
    if (!application.officer_verified) {
      return res.status(400).json({ error: 'Documents must be verified first' });
    }

    // VALIDATION: Interview must be scheduled
    if (!application.interview_date) {
      return res.status(400).json({ error: 'Interview must be scheduled first' });
    }

    // SEAT MANAGEMENT: If selecting a student, reduce available seats
    if (status === 'selected') {
      const courseId = application.course_preference_1 || application.course_id;

      if (!courseId) {
        return res.status(400).json({ error: 'No course assigned' });
      }

      const [courses] = await pool.query('SELECT available_seats, name FROM courses WHERE id = ?', [courseId]);
      
      if (courses.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (courses[0].available_seats <= 0) {
        return res.status(400).json({ error: `No seats available for ${courses[0].name}` });
      }

      // Start transaction
      await pool.query('START TRANSACTION');

      try {
        // Reduce available seats
        await pool.query('UPDATE courses SET available_seats = available_seats - 1 WHERE id = ?', [courseId]);
        
        // Update selection status
        await pool.query('UPDATE applications SET selection_status = ? WHERE id = ?', [status, id]);
        
        await pool.query('COMMIT');

        console.log(`[SELECTION] Student ${id} SELECTED - Seat reduced for course ${courseId}`);
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    } else {
      // For waitlisted or rejected, just update status
      await pool.query('UPDATE applications SET selection_status = ? WHERE id = ?', [status, id]);
      console.log(`[SELECTION] Student ${id} marked as ${status.toUpperCase()}`);
    }

    res.json({ success: true, message: `Student ${status} successfully` });
  } catch (err) {
    try {
      await pool.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    console.error('Selection error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ==================== REPORTS ==================== */

app.get("/api/reports/admission", async (req, res) => {
  try {
    const [[total]] = await pool.query("SELECT COUNT(*) as total FROM applications WHERE is_draft=0");
    const [[approved]] = await pool.query("SELECT COUNT(*) as approved FROM applications WHERE status='approved' AND is_draft=0");
    const [[selected]] = await pool.query("SELECT COUNT(*) as selected FROM applications WHERE selection_status='selected' AND is_draft=0");
    const [[waitlisted]] = await pool.query("SELECT COUNT(*) as waitlisted FROM applications WHERE selection_status='waitlisted' AND is_draft=0");
    const [[rejected]] = await pool.query("SELECT COUNT(*) as rejected FROM applications WHERE selection_status='rejected' AND is_draft=0");
    const [[paid]] = await pool.query("SELECT COUNT(*) as paid FROM applications WHERE payment_status='paid' AND is_draft=0");

    res.json({
      totalApplications: total.total,
      approvedApplications: approved.approved,
      selectedStudents: selected.selected,
      waitlistedStudents: waitlisted.waitlisted,
      rejectedStudents: rejected.rejected,
      paidApplications: paid.paid,
    });
  } catch (err) {
    console.error("Admission report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

app.get("/api/reports/course-wise", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.name, c.total_seats, c.available_seats,
       COUNT(a.id) as applications,
       SUM(CASE WHEN a.selection_status='selected' THEN 1 ELSE 0 END) as selected
       FROM courses c
       LEFT JOIN applications a ON c.id = a.course_preference_1 AND a.is_draft=0
       GROUP BY c.id, c.name, c.total_seats, c.available_seats`
    );
    res.json(rows);
  } catch (err) {
    console.error("Course report error:", err);
    res.status(500).json({ error: "Failed to generate course report" });
  }
});

app.get("/api/reports/payment", async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT 
       COUNT(*) as total_payments,
       SUM(payment_amount) as total_collected,
       SUM(CASE WHEN payment_status='paid' THEN payment_amount ELSE 0 END) as paid_amount,
       SUM(CASE WHEN payment_status='pending' THEN payment_amount ELSE 0 END) as pending_amount
       FROM applications WHERE is_draft=0`
    );

    const [byDate] = await pool.query(
      `SELECT DATE(payment_date) as date, COUNT(*) as count, SUM(payment_amount) as amount
       FROM applications 
       WHERE payment_status='paid' AND is_draft=0
       GROUP BY DATE(payment_date)
       ORDER BY date DESC
       LIMIT 30`
    );

    res.json({ totals: totals, byDate });
  } catch (err) {
    console.error("Payment report error:", err);
    res.status(500).json({ error: "Failed to generate payment report" });
  }
});



/* ==================== FPAYMENT ROUTES ==================== */

// Get Razorpay key (for frontend)
app.get("/api/payment/razorpay-key", (req, res) => {
  res.json({ 
    key: process.env.RZP_KEY 
  });
});

// Create Razorpay Order
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { applicationId, amount } = req.body;

    console.log("[PAYMENT] Create order request:", { applicationId, amount });

    // Validation
    if (!applicationId || !amount) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: { applicationId: !!applicationId, amount: !!amount }
      });
    }

    // Verify Razorpay credentials
    if (!process.env.RZP_KEY || !process.env.RZP_SECRET) {
      console.error("[PAYMENT] Razorpay credentials missing in .env");
      return res.status(500).json({ 
        error: "Payment gateway not configured" 
      });
    }

    // Verify application exists and is selected
    const [apps] = await pool.query(
      `SELECT id, student_name, email, selection_status, payment_status 
       FROM applications 
       WHERE id = ?`,
      [applicationId]
    );

    if (apps.length === 0) {
      console.log("[PAYMENT] Application not found:", applicationId);
      return res.status(404).json({ error: "Application not found" });
    }

    const app = apps[0];

    // Check if already paid
    if (app.payment_status === 'paid') {
      console.log("[PAYMENT] Application already paid:", applicationId);
      return res.status(400).json({ 
        error: "Payment already completed for this application" 
      });
    }

    // Check if selected
    if (app.selection_status !== 'selected') {
      console.log("[PAYMENT] Application not selected:", applicationId);
      return res.status(400).json({ 
        error: "Only selected students can make payment",
        status: app.selection_status
      });
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RZP_KEY,
      key_secret: process.env.RZP_SECRET,
    });

    // Create Razorpay order - amount should be in paise
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `receipt_${applicationId}_${Date.now()}`,
      notes: {
        applicationId: applicationId.toString(),
        studentName: app.student_name,
        email: app.email
      },
    };

    console.log("[PAYMENT] Creating Razorpay order:", options);

    const order = await instance.orders.create(options);

    console.log("[PAYMENT] Order created successfully:", {
      orderId: order.id,
      amount: order.amount,
      applicationId
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY // Send key to frontend
    });

  } catch (error) {
    console.error("[PAYMENT] Error creating order:", error);
    res.status(500).json({ 
      error: "Failed to create payment order",
      details: error.message 
    });
  }
});

// Verify Payment - UPDATED VERSION
app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
    } = req.body;

    console.log("[PAYMENT] Verify request:", {
      razorpay_order_id,
      razorpay_payment_id,
      applicationId
    });

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields"
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RZP_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("[PAYMENT] Signature verification:", {
      match: razorpay_signature === expectedSign
    });

    if (razorpay_signature !== expectedSign) {
      console.error("[PAYMENT] Signature mismatch");
      return res.status(400).json({
        success: false,
        error: "Invalid signature - Payment verification failed",
      });
    }

    // Get the actual payment amount from Razorpay order
    const instance = new Razorpay({
      key_id: process.env.RZP_KEY,
      key_secret: process.env.RZP_SECRET,
    });

    const orderDetails = await instance.orders.fetch(razorpay_order_id);
    const actualAmount = orderDetails.amount / 100; // Convert paise to rupees

    console.log("[PAYMENT] Order details fetched:", {
      orderId: orderDetails.id,
      amount: actualAmount
    });

    // ✅ Payment verified - Update database with CORRECT column names
    const [result] = await pool.query(
      `UPDATE applications 
       SET payment_status = 'paid',
           payment_id = ?,
           razorpay_order_id = ?,
           razorpay_payment_id = ?,
           razorpay_signature = ?,
           payment_date = NOW(),
           payment_amount = ?
       WHERE id = ?`,
      [
        razorpay_payment_id,      // For legacy payment_id column
        razorpay_order_id,         // New Razorpay order ID
        razorpay_payment_id,       // New Razorpay payment ID
        razorpay_signature,        // Store signature for records
        actualAmount,              // Actual payment amount from Razorpay
        applicationId
      ]
    );

    console.log("[PAYMENT] Database updated:", {
      applicationId,
      affectedRows: result.affectedRows
    });

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        error: "Failed to update payment status"
      });
    }

    console.log(`[PAYMENT] ✅ Payment completed for application ${applicationId} - Amount: ₹${actualAmount}`);

    res.json({
      success: true,
      message: "Payment verified and recorded successfully",
    });

  } catch (error) {
    console.error("[PAYMENT] Verification error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
      details: error.message
    });
  }
});

// Get payment status - UPDATED
app.get("/api/payment/status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const [result] = await pool.query(
      `SELECT 
        payment_status, 
        payment_id,
        razorpay_order_id,
        razorpay_payment_id,
        payment_date, 
        payment_amount,
        selection_status
       FROM applications 
       WHERE id = ?`,
      [applicationId]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("[PAYMENT] Error fetching payment status:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

app.post("/api/payment/pay", async (req, res) => {
  try {
    const { applicationId, amount } = req.body;
    
    const [rows] = await pool.query(
      `SELECT a.student_name, a.phone, c.name as course_name 
       FROM applications a 
       LEFT JOIN courses c ON a.course_preference_1 = c.id 
       WHERE a.id = ?`,
      [applicationId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    const student = rows[0];
    
    const receiptData = {
      receiptNo: "REC" + Date.now(),
      studentName: student.student_name,
      applicationId: applicationId,
      course: student.course_name,
      amount: amount || 100,
    };

    const receiptFile = generateReceipt(receiptData);
    
    await pool.query(
      "UPDATE applications SET payment_status='paid', payment_date=NOW(), payment_amount=? WHERE id=?",
      [amount || 100, applicationId]
    );

    res.json({
      success: true,
      receiptFile,
    });
  } catch (err) {
    console.error("Payment processing error:", err);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

/* ==================== SERVER START ==================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} ✓`));