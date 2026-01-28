// routes/officer.js - Officer Dashboard Routes
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// GET /api/officer/stats - Officer dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        COUNT(*) as totalEligible,
        SUM(CASE WHEN officer_verified = 1 THEN 1 ELSE 0 END) as verifiedDocuments,
        SUM(CASE WHEN selection_status = 'selected' THEN 1 ELSE 0 END) as selectedStudents,
        SUM(CASE WHEN officer_verified = 0 OR officer_verified IS NULL THEN 1 ELSE 0 END) as pendingReview
      FROM applications
      WHERE is_draft = 0 AND status = 'approved'
    `;

    const [results] = await pool.query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching officer stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/officer/applications - Get all eligible applications for officer review
router.get('/applications', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        a.*,
        c.name as course_name
      FROM applications a
      LEFT JOIN courses c ON a.course_preference_1 = c.id
      WHERE a.is_draft = 0 AND a.status = 'approved'
      ORDER BY a.id DESC
    `;

    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PATCH /api/applications/:id/officer-verification - Verify documents
router.patch('/:id/officer-verification', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;
    const { officer_verified } = req.body;

    const [result] = await pool.query(
      'UPDATE applications SET officer_verified = ? WHERE id = ?',
      [officer_verified, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ success: true, message: 'Document verification updated' });
  } catch (error) {
    console.error('Error updating verification:', error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// POST /api/applications/:id/reject-documents - Reject documents and application
router.post('/:id/reject-documents', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;

    // Update both verification and selection status
    const [result] = await pool.query(
      `UPDATE applications 
       SET officer_verified = 0, 
           selection_status = 'rejected',
           status = 'rejected'
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      success: true, 
      message: 'Documents rejected and application rejected' 
    });
  } catch (error) {
    console.error('Error rejecting documents:', error);
    res.status(500).json({ error: 'Failed to reject documents' });
  }
});

// POST /api/applications/:id/request-document - Request additional documents
router.post('/:id/request-document', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;
    const { documentRequest } = req.body;

    // Store the document request in the database
    const [result] = await pool.query(
      `UPDATE applications 
       SET document_request = ?, 
           document_request_date = NOW()
       WHERE id = ?`,
      [documentRequest, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // You could also send an email notification here
    res.json({ 
      success: true, 
      message: 'Document request sent to student' 
    });
  } catch (error) {
    console.error('Error requesting documents:', error);
    res.status(500).json({ error: 'Failed to send document request' });
  }
});

// PATCH /api/applications/:id/interview-date - Schedule interview
router.patch('/:id/interview-date', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;
    const { interview_date } = req.body;

    const [result] = await pool.query(
      'UPDATE applications SET interview_date = ? WHERE id = ?',
      [interview_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ success: true, message: 'Interview scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

// POST /api/officer/bulk-schedule-interview - Bulk schedule interviews by course
router.post('/bulk-schedule-interview', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { courseId, interviewDate } = req.body;

    if (!courseId || !interviewDate) {
      return res.status(400).json({ error: "Course ID and interview date are required" });
    }

    console.log(`[BULK INTERVIEW] Scheduling for course ID: ${courseId}`);

    // Get course name
    const [courseData] = await pool.query("SELECT name FROM courses WHERE id = ?", [courseId]);
    
    if (courseData.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseName = courseData[0].name;

    // Get all verified students for the selected course who don't have interviews scheduled
    const [students] = await pool.query(
      `SELECT a.id, a.student_name 
       FROM applications a
       WHERE a.status = 'approved' 
       AND a.officer_verified = 1 
       AND a.interview_date IS NULL
       AND a.course_preference_1 = ?`,
      [courseId]
    );

    if (students.length === 0) {
      return res.status(400).json({ 
        error: `No verified students found without interviews in ${courseName}` 
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

    console.log(`[BULK INTERVIEW] Scheduled for ${result.affectedRows} students in ${courseName}`);

    res.json({
      success: true,
      scheduled: result.affectedRows,
      courseName: courseName,
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

// PATCH /api/applications/:id/selection-status - Update final selection decision
router.patch('/:id/selection-status', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;
    const { selection_status } = req.body;

    // Validate selection status
    const validStatuses = ['selected', 'waitlisted', 'rejected'];
    if (!validStatuses.includes(selection_status)) {
      return res.status(400).json({ error: 'Invalid selection status' });
    }

    const [result] = await pool.query(
      'UPDATE applications SET selection_status = ? WHERE id = ?',
      [selection_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      success: true, 
      message: `Student ${selection_status} successfully` 
    });
  } catch (error) {
    console.error('Error updating selection status:', error);
    res.status(500).json({ error: 'Failed to update selection status' });
  }
});

// GET /api/officer/admission-letter/:id - Generate admission letter PDF
router.get('/admission-letter/:id', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { id } = req.params;

    // Get student details
    const [students] = await pool.query(
      `SELECT a.*, c.name as course_name
       FROM applications a
       LEFT JOIN courses c ON a.course_preference_1 = c.id
       WHERE a.id = ? AND a.selection_status = 'selected'`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Selected student not found' });
    }

    const student = students[0];

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Admission_Letter_${student.student_name.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('TIE COLLEGE', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Department of Admissions', { align: 'center' });
    doc.moveDown(2);

    // Date
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(1);

    // Letter body
    doc.fontSize(14).font('Helvetica-Bold').text('ADMISSION LETTER', { align: 'center', underline: true });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica').text(`Dear ${student.student_name},`, { align: 'left' });
    doc.moveDown(1);

    doc.text('Congratulations!', { continued: false });
    doc.moveDown(0.5);

    doc.text(`We are pleased to inform you that you have been selected for admission to:`, { align: 'left' });
    doc.moveDown(1);

    doc.font('Helvetica-Bold').text(`Course: ${student.course_name}`, { align: 'center' });
    doc.moveDown(1);

    doc.font('Helvetica').text('Please report to the college office with the following documents for final verification and enrollment:', { align: 'left' });
    doc.moveDown(0.5);

    const documents = [
      '1. All original educational certificates',
      '2. Transfer certificate',
      '3. Character certificate',
      '4. Passport size photographs (4 copies)',
      '5. Caste certificate (if applicable)',
      '6. Income certificate (if applicable)'
    ];

    documents.forEach(item => {
      doc.fontSize(11).text(item, { indent: 20 });
    });

    doc.moveDown(2);

    doc.fontSize(12).text('Please complete the enrollment formalities within 7 days of receiving this letter.', { align: 'left' });
    doc.moveDown(1);

    doc.text('We look forward to welcoming you to TIE College.', { align: 'left' });
    doc.moveDown(2);

    doc.text('Best Regards,', { align: 'left' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Admission Office', { align: 'left' });
    doc.font('Helvetica').text('TIE College', { align: 'left' });

    // Footer
    doc.moveDown(3);
    doc.fontSize(9).text('This is a computer-generated document and does not require a signature.', { align: 'center', color: 'gray' });

    doc.end();

  } catch (error) {
    console.error('Error generating admission letter:', error);
    res.status(500).json({ error: 'Failed to generate admission letter' });
  }
});

// POST /api/officer/notify - Send notifications to students
router.post('/notify', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const { studentIds, message } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs are required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Store notifications in database (you may want to create a notifications table)
    const placeholders = studentIds.map(() => '(?, ?, NOW())').join(',');
    const values = studentIds.flatMap(id => [id, message]);

    // For now, we'll just update a notification field in applications
    // You might want to create a separate notifications table
    const updatePlaceholders = studentIds.map(() => '?').join(',');
    
    await pool.query(
      `UPDATE applications 
       SET last_notification = ?,
           last_notification_date = NOW()
       WHERE id IN (${updatePlaceholders})`,
      [message, ...studentIds]
    );

    // Here you would typically send emails or SMS
    // For this example, we're just storing the notification

    res.json({ 
      success: true, 
      message: `Notification sent to ${studentIds.length} students`,
      count: studentIds.length
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

module.exports = router;