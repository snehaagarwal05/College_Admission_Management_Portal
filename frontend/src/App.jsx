import React, { useState } from "react";
import IntroLoader from "./components/IntroLoader/IntroLoader";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import AllNews from "./components/home/AllNews";
import Login from "./components/login/Login";
import StudentDashboard from "./components/student/StudentDashboard";
import Faculty from "./components/faculty/Faculty";
import ProtectedRoute from "./components/ProtectedRoute";
import Admission from "./components/admission/Admission";
import CampusLife from "./components/campus/CampusLife";
import AdmissionPage from "./components/Admin/AdmissionForm";
import Department from "./components/department/Department";
import About from "./components/about/About";
import Contact from "./components/contact/Contact";
import Nirf from "./components/nirf/Nirf";
import Footer from "./components/footer/Footer";
import AdminApplications from "./components/Admin/AdminApplications";
import StudentApplicationStatus from "./components/student/StudentApplicationStatus";
import OfficerDashboard from "./components/officer/OfficerDashboard";
import AdminCourseManagement from './components/Admin/AdminCourseManagement';
import ReportsPage from './components/Admin/ReportsPage';
import ApplicationFee from "./components/student/ApplicationFee";
import CounsellingList from "./components/Admin/CounsellingList";
import PaymentPage from "./PaymentPage";

const AdminDashboard = () => (
  <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
    <h1 style={{ marginBottom: '30px', color: '#2d3748' }}>Admin Dashboard</h1>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px',
      marginTop: '30px'
    }}>
      <a href="/admin/applications" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
        <h3 style={{ margin: '0 0 10px 0' }}>View Applications</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Review, approve or reject applications</p>
      </a>

      <a href="/admin/courses" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        color: 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
        <h3 style={{ margin: '0 0 10px 0' }}>Manage Courses</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Add, edit or delete courses</p>
      </a>

      <a href="/admin/reports" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
        color: 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(237, 137, 54, 0.3)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
        <h3 style={{ margin: '0 0 10px 0' }}>View Reports</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Analytics and statistics</p>
      </a>

      <a href="/admin/counselling-list" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        color: 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 4px 15px rgba(66, 153, 225, 0.3)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎓</div>
        <h3 style={{ margin: '0 0 10px 0' }}>Counselling List</h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Generate and manage counselling</p>
      </a>
    </div>
  </div>
);

const AdmissionOfficerDashboard = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Admission Officer Dashboard</h1>
    <p>Redirecting to Officer Dashboard...</p>
  </div>
);

function App() {
  const [showLoader, setShowLoader] = useState(true);
  
  if (showLoader) {
    return <IntroLoader onFinish={() => setShowLoader(false)} />;
  }

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<AllNews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/faculty" element={<Faculty/>}/>
        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />       
        <Route
          path="/application-status"
          element={
            <ProtectedRoute role="student">
              <StudentApplicationStatus />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/application-fee/:id"
          element={
            <ProtectedRoute role="student">
              <ApplicationFee />
            </ProtectedRoute>
          }
        />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route
          path="/payment"
          element={
            <ProtectedRoute role="student">
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute role="admin">
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/counselling-list"
          element={
            <ProtectedRoute role="admin">
              <CounsellingList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute role="admin">
              <AdminCourseManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Admission Officer Routes */}
        <Route
          path="/admissionOfficer"
          element={
            <ProtectedRoute role="admissionOfficer">
              <AdmissionOfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/officer"
          element={
            <ProtectedRoute role="admissionOfficer">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Public Routes */}
        <Route path="/campus" element={<CampusLife />} />
        <Route path="/admissionPage" element={<AdmissionPage />} />
        <Route path="/department" element={<Department />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/nirf" element={<Nirf />} />
        <Route path="/footer" element={<Footer />} />
      </Routes>
    </Router>
  );
}

export default App;