// routes/reports.js
const express = require('express');
const router = express.Router();

// We'll access the pool through the app, which is set in index.js

// GET /api/reports/admission - Admission statistics
router.get('/admission', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        COUNT(*) as totalApplications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedApplications,
        SUM(CASE WHEN selection_status = 'selected' THEN 1 ELSE 0 END) as selectedStudents,
        SUM(CASE WHEN selection_status = 'waitlisted' THEN 1 ELSE 0 END) as waitlistedStudents,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedStudents,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paidApplications
      FROM applications
      WHERE is_draft = 0
    `;

    const [results] = await pool.query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching admission report:', error);
    res.status(500).json({ error: 'Failed to fetch admission report' });
  }
});

// GET /api/reports/course-wise - Course-wise statistics
router.get('/course-wise', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    const query = `
      SELECT 
        c.id,
        c.name,
        c.department,
        c.level,
        c.total_seats,
        c.available_seats,
        c.course_fees,
        COUNT(a.id) as applications,
        SUM(CASE WHEN a.selection_status = 'selected' THEN 1 ELSE 0 END) as selected
      FROM courses c
      LEFT JOIN applications a ON c.id = a.course_preference_1 AND a.is_draft = 0
      GROUP BY c.id, c.name, c.department, c.level, c.total_seats, c.available_seats, c.course_fees
      ORDER BY c.name
    `;

    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching course-wise report:', error);
    res.status(500).json({ error: 'Failed to fetch course-wise report' });
  }
});

// GET /api/reports/payment - Payment statistics summary
router.get('/payment', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    // Get totals
    const totalsQuery = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN payment_status = 'paid' THEN COALESCE(payment_amount, 0) ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status != 'paid' OR payment_status IS NULL THEN COALESCE(c.course_fees, 0) ELSE 0 END) as pending_amount
      FROM applications a
      LEFT JOIN courses c ON a.course_preference_1 = c.id
      WHERE a.is_draft = 0 AND a.status IN ('approved', 'pending')
    `;

    // Get payments by date
    const byDateQuery = `
      SELECT 
        DATE(payment_date) as date,
        COUNT(*) as count,
        SUM(payment_amount) as amount
      FROM applications
      WHERE payment_status = 'paid' AND payment_date IS NOT NULL
      GROUP BY DATE(payment_date)
      ORDER BY date DESC
      LIMIT 10
    `;

    const [totalsResults] = await pool.query(totalsQuery);
    const [byDateResults] = await pool.query(byDateQuery);

    res.json({
      totals: totalsResults[0],
      byDate: byDateResults
    });
  } catch (error) {
    console.error('Error fetching payment report:', error);
    res.status(500).json({ error: 'Failed to fetch payment report' });
  }
});

// GET /api/reports/payment-details - Detailed payment information per student
router.get('/payment-details', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    
    console.log('[PAYMENT DETAILS] Fetching payment details...');
    
    const query = `
      SELECT 
        a.id as application_id,
        a.student_name,
        a.email,
        a.phone,
        c.name as course_name,
        c.course_fees,
        a.payment_status,
        a.payment_amount as amount_paid,
        a.payment_date,
        a.payment_id as transaction_id
      FROM applications a
      LEFT JOIN courses c ON a.course_preference_1 = c.id
      WHERE a.is_draft = 0
      ORDER BY c.name, a.student_name
    `;

    const [results] = await pool.query(query);
    
    console.log(`[PAYMENT DETAILS] Found ${results.length} records`);
    
    // Format the results to ensure consistency
    const formattedResults = results.map(row => ({
      application_id: row.application_id,
      student_name: row.student_name,
      email: row.email,
      phone: row.phone,
      course_name: row.course_name || 'Not assigned',
      course_fees: row.course_fees || 0,
      payment_status: row.payment_status || 'pending',
      amount_paid: row.amount_paid || 0,
      payment_date: row.payment_date,
      transaction_id: row.transaction_id
    }));
    
    res.json(formattedResults);
    
  } catch (error) {
    console.error('[PAYMENT DETAILS] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      message: error.message 
    });
  }
});

module.exports = router;