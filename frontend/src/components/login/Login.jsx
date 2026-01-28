import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../data";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("admin"); // "admin" or "student"
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    // Find admin/officer user with matching email and password
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      // Navigate based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "admissionOfficer":
          navigate("/officer");
          break;
        default:
          navigate("/");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!applicationId || !email) {
      setError("Please enter both Application ID and Email");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, email })
      });

      const data = await res.json();

      if (res.ok) {
        // Store student user data
        const studentUser = {
          ...data.user,
          role: "student"
        };
        localStorage.setItem("user", JSON.stringify(studentUser));
        
        // Navigate to student dashboard
        navigate("/student-dashboard");
      } else {
        setError(data.error || "Invalid Application ID or Email");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login Portal</h2>
        
        {/* Login Type Toggle */}
        <div className="login-type-toggle" style={{
          display: "flex",
          marginBottom: "20px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #e5e7eb"
        }}>
          <button
            type="button"
            onClick={() => {
              setLoginType("admin");
              setError("");
              setApplicationId("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              background: loginType === "admin" ? "#667eea" : "white",
              color: loginType === "admin" ? "white" : "#666",
              fontWeight: loginType === "admin" ? "600" : "normal",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Admin / Officer
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType("student");
              setError("");
              setPassword("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              background: loginType === "student" ? "#667eea" : "white",
              color: loginType === "student" ? "white" : "#666",
              fontWeight: loginType === "student" ? "600" : "normal",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Applicants
          </button>
        </div>

        {/* Admin/Officer Login Form */}
        {loginType === "admin" && (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">
              Login as Admin/Officer
            </button>
          </form>
        )}

        {/* Student Login Form */}
        {loginType === "student" && (
          <form onSubmit={handleStudentLogin}>
            <div className="form-group">
              <label>Application ID:</label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter your Application ID"
                required
              />
              <small style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                You received this after submitting your application
              </small>
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">
              Access Student Dashboard
            </button>
            
            <div style={{ 
              marginTop: "16px", 
              padding: "12px", 
              background: "#f3f4f6", 
              borderRadius: "8px",
              fontSize: "0.9rem",
              color: "#4b5563"
            }}>
              
            </div>
          </form>
        )}

        {/* Demo Credentials */}
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f9fafb",
          borderRadius: "8px",
          fontSize: "0.85rem"
        }}>
          <strong>Demo Credentials:</strong>
          <div style={{ marginTop: "8px" }}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Admin:</strong><br />
              Email: admin@college.edu<br />
              Password: admin123
            </div>
            <div>
              <strong>Officer:</strong><br />
              Email: officer@college.edu<br />
              Password: officer123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}