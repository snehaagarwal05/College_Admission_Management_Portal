import React, { useState, useEffect } from "react";
import "./ReportsPage.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const ReportsPage = () => {
  const [admissionStats, setAdmissionStats] = useState(null);
  const [courseWiseData, setCourseWiseData] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("admission");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const courseChartData = courseWiseData.map(course => ({
    name: course.name,
    Applications: course.applications,
    Selected: course.selected
  }));

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      // Fetch admission report
      const admissionRes = await fetch("http://localhost:5000/api/reports/admission");
      const admissionData = await admissionRes.json();
      setAdmissionStats(admissionData);

      // Fetch course-wise report
      const courseRes = await fetch("http://localhost:5000/api/reports/course-wise");
      const courseData = await courseRes.json();
      setCourseWiseData(courseData);

      // Fetch payment report
      const paymentRes = await fetch("http://localhost:5000/api/reports/payment");
      const paymentDataResult = await paymentRes.json();
      setPaymentData(paymentDataResult);

      // Fetch detailed payment information (students with payment status)
      const paymentDetailsRes = await fetch("http://localhost:5000/api/reports/payment-details");
      const paymentDetailsData = await paymentDetailsRes.json();
      setPaymentDetails(paymentDetailsData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Filter payment details by course
  const filteredPaymentDetails = selectedCourse === "all" 
    ? paymentDetails 
    : paymentDetails.filter(detail => detail.course_name === selectedCourse);

  // Calculate course-wise payment statistics
  const coursePaymentStats = courseWiseData.map(course => {
    const coursePayments = paymentDetails.filter(p => p.course_name === course.name);
    const paidCount = coursePayments.filter(p => p.payment_status === 'paid').length;
    const pendingCount = coursePayments.filter(p => p.payment_status === 'pending').length;
    const paidAmount = coursePayments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
    const pendingAmount = coursePayments
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, p) => sum + (parseFloat(p.course_fees) || 0), 0);
    
    return {
      course_name: course.name,
      total_students: coursePayments.length,
      paid_count: paidCount,
      pending_count: pendingCount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      total_amount: paidAmount + pendingAmount
    };
  });

  if (loading) {
    return (
      <div className="reports-container">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Reports & Analytics</h1>
        <p>Comprehensive admission and payment insights</p>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab ${activeTab === "admission" ? "active" : ""}`}
          onClick={() => setActiveTab("admission")}
        >
          📋 Admission Report
        </button>
        <button
          className={`tab ${activeTab === "course" ? "active" : ""}`}
          onClick={() => setActiveTab("course")}
        >
          🎓 Course-wise Report
        </button>
        <button
          className={`tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          💰 Payment Report
        </button>
      </div>

      {/* Admission Report */}
      {activeTab === "admission" && admissionStats && (
        <div className="report-section">
          <div className="report-header-row">
            <h2>Admission Statistics</h2>
            <button
              className="btn-export"
              onClick={() =>
                exportToCSV(
                  [admissionStats],
                  "admission_report.csv"
                )
              }
            >
              📥 Export CSV
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <p className="stat-label">Total Applications</p>
                <h3 className="stat-value">{admissionStats.totalApplications}</h3>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <p className="stat-label">Approved Applications</p>
                <h3 className="stat-value">{admissionStats.approvedApplications}</h3>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">🎉</div>
              <div className="stat-info">
                <p className="stat-label">Selected Students</p>
                <h3 className="stat-value">{admissionStats.selectedStudents}</h3>
              </div>
            </div>

            <div className="stat-card orange">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <p className="stat-label">Waitlisted Students</p>
                <h3 className="stat-value">{admissionStats.waitlistedStudents}</h3>
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <p className="stat-label">Rejected Students</p>
                <h3 className="stat-value">{admissionStats.rejectedStudents}</h3>
              </div>
            </div>

            <div className="stat-card teal">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <p className="stat-label">Paid Applications</p>
                <h3 className="stat-value">{admissionStats.paidApplications}</h3>
              </div>
            </div>
          </div>

          {/* Visual Chart */}
          <div className="chart-container">
            <h3>Application Status Distribution</h3>
            <div className="bar-chart">
              <div className="bar-item">
                <div className="bar-label">Selected</div>
                <div className="bar-wrapper">
                  <div
                    className="bar selected"
                    style={{
                      width: `${
                        (admissionStats.selectedStudents /
                          admissionStats.totalApplications) *
                        100
                      }%`,
                    }}
                  >
                    {admissionStats.selectedStudents}
                  </div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label">Waitlisted</div>
                <div className="bar-wrapper">
                  <div
                    className="bar waitlisted"
                    style={{
                      width: `${
                        (admissionStats.waitlistedStudents /
                          admissionStats.totalApplications) *
                        100
                      }%`,
                    }}
                  >
                    {admissionStats.waitlistedStudents}
                  </div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label">Rejected</div>
                <div className="bar-wrapper">
                  <div
                    className="bar rejected"
                    style={{
                      width: `${
                        (admissionStats.rejectedStudents /
                          admissionStats.totalApplications) *
                        100
                      }%`,
                    }}
                  >
                    {admissionStats.rejectedStudents}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course-wise Report */}
      {activeTab === "course" && (
        <div className="report-section">
          <div className="report-header-row">
            <h2>Course-wise Statistics</h2>
            <button
              className="btn-export"
              onClick={() => exportToCSV(courseWiseData, "course_wise_report.csv")}
            >
              📥 Export CSV
            </button>
          </div>

          {/* Course-wise Horizontal Bar Chart */}
          <div className="chart-container">
            <h3>Applications vs Selected (Course-wise)</h3>
            <ResponsiveContainer
              width="100%"
              height={courseChartData.length * 55}
            >
              <BarChart
                data={courseChartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={180}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="Applications" fill="#6366f1" radius={[0, 6, 6, 0]} />
                <Bar dataKey="Selected" fill="#22c55e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Total Seats</th>
                  <th>Available Seats</th>
                  <th>Applications</th>
                  <th>Selected</th>
                  <th>Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {courseWiseData.map((course, index) => {
                  const occupancyRate =
                    ((course.total_seats - course.available_seats) /
                      course.total_seats) *
                    100;

                  return (
                    <tr key={index}>
                      <td className="course-name">{course.name}</td>
                      <td>{course.total_seats}</td>
                      <td>
                        <span
                          className={
                            course.available_seats > 0
                              ? "seats-available"
                              : "seats-full"
                          }
                        >
                          {course.available_seats}
                        </span>
                      </td>
                      <td>{course.applications}</td>
                      <td>{course.selected}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                          <span className="progress-text">
                            {occupancyRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Report */}
      {activeTab === "payment" && paymentData && (
        <div className="report-section">
          <div className="report-header-row">
            <h2>Payment Statistics</h2>
            <button
              className="btn-export"
              onClick={() =>
                exportToCSV(
                  filteredPaymentDetails.map(p => ({
                    student_name: p.student_name,
                    email: p.email,
                    course: p.course_name,
                    course_fees: p.course_fees,
                    payment_status: p.payment_status,
                    amount_paid: p.amount_paid || 0
                  })),
                  `payment_details_${selectedCourse === 'all' ? 'all' : selectedCourse}.csv`
                )
              }
            >
              📥 Export CSV
            </button>
          </div>

          {/* Course Filter */}
          <div className="filter-section" style={{ marginBottom: '20px' }}>
            <label htmlFor="coursePaymentFilter" style={{ marginRight: '10px', fontWeight: '600' }}>
              Filter by Course:
            </label>
            <select
              id="coursePaymentFilter"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '14px'
              }}
            >
              <option value="all">All Courses</option>
              {courseWiseData.map((course) => (
                <option key={course.name} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course-wise Payment Summary */}
          <div className="payment-summary-section">
            <h3>Course-wise Payment Summary</h3>
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Total Students</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Amount Collected</th>
                    <th>Pending Amount</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePaymentStats
                    .filter(stat => selectedCourse === 'all' || stat.course_name === selectedCourse)
                    .map((stat, index) => (
                      <tr key={index}>
                        <td className="course-name">{stat.course_name}</td>
                        <td>{stat.total_students}</td>
                        <td>
                          <span className="status-pill status-approved">
                            {stat.paid_count}
                          </span>
                        </td>
                        <td>
                          <span className="status-pill status-pending">
                            {stat.pending_count}
                          </span>
                        </td>
                        <td style={{ color: '#22c55e', fontWeight: '600' }}>
                          ₹{stat.paid_amount.toLocaleString()}
                        </td>
                        <td style={{ color: '#f59e0b', fontWeight: '600' }}>
                          ₹{stat.pending_amount.toLocaleString()}
                        </td>
                        <td style={{ fontWeight: '700' }}>
                          ₹{stat.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  {selectedCourse === 'all' && (
                    <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                      <td>TOTAL</td>
                      <td>{paymentDetails.length}</td>
                      <td>
                        <span className="status-pill status-approved">
                          {paymentDetails.filter(p => p.payment_status === 'paid').length}
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-pending">
                          {paymentDetails.filter(p => p.payment_status === 'pending').length}
                        </span>
                      </td>
                      <td style={{ color: '#22c55e' }}>
                        ₹{coursePaymentStats.reduce((sum, s) => sum + s.paid_amount, 0).toLocaleString()}
                      </td>
                      <td style={{ color: '#f59e0b' }}>
                        ₹{coursePaymentStats.reduce((sum, s) => sum + s.pending_amount, 0).toLocaleString()}
                      </td>
                      <td>
                        ₹{coursePaymentStats.reduce((sum, s) => sum + s.total_amount, 0).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Student Payment List */}
          <div className="payment-details-section" style={{ marginTop: '30px' }}>
            <h3>
              Student Payment Details 
              {selectedCourse !== 'all' && ` - ${selectedCourse}`}
            </h3>
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Course Fees</th>
                    <th>Payment Status</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentDetails.length > 0 ? (
                    filteredPaymentDetails.map((detail, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: '600' }}>{detail.student_name}</td>
                        <td>{detail.email}</td>
                        <td>{detail.course_name}</td>
                        <td>₹{Number(detail.course_fees).toLocaleString()}</td>
                        <td>
                          <span className={`status-pill status-${detail.payment_status === 'paid' ? 'approved' : 'pending'}`}>
                            {detail.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ 
                          color: detail.payment_status === 'paid' ? '#22c55e' : '#94a3b8',
                          fontWeight: '600'
                        }}>
                          ₹{Number(detail.amount_paid || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No payment records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;