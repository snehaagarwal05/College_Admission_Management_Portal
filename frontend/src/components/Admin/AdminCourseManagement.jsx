import React, { useState, useEffect } from "react";
import "./AdminCourseManagement.css";

const AdminCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    level: "",
    total_seats: 0,
    available_seats: 0,
    eligibility_criteria: "",
    course_fees: 0,
  });

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
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      department: "",
      level: "",
      total_seats: 0,
      available_seats: 0,
      eligibility_criteria: "",
      course_fees: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      department: course.department,
      level: course.level,
      total_seats: course.total_seats,
      available_seats: course.available_seats,
      eligibility_criteria: course.eligibility_criteria || "",
      course_fees: course.course_fees || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        // Update existing course
        const res = await fetch(`http://localhost:5000/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          alert("Course updated successfully!");
        }
      } else {
        // Create new course
        const res = await fetch("http://localhost:5000/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          alert("Course created successfully!");
        }
      }

      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      alert("Failed to save course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Course deleted successfully!");
        fetchCourses();
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="course-management-container">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="course-management-container">
      <div className="course-header">
        <h1>📚 Course Management</h1>
        <button className="btn-add-course" onClick={openAddModal}>
          ➕ Add New Course
        </button>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card-admin">
            <div className="course-card-header">
              <h3>{course.name}</h3>
              <span className="course-level-badge">{course.level}</span>
            </div>

            <div className="course-details">
              <p>
                <strong>Department:</strong> {course.department}
              </p>
              <p>
                <strong>Total Seats:</strong> {course.total_seats}
              </p>
              <p>
                <strong>Available Seats:</strong>{" "}
                <span className={course.available_seats > 0 ? "seats-available" : "seats-full"}>
                  {course.available_seats}
                </span>
              </p>
              <p>
                <strong>Course Fees:</strong> ₹{Number(course.course_fees).toLocaleString()}
              </p>
              <p>
                <strong>Eligibility:</strong>{" "}
                {course.eligibility_criteria || "Not specified"}
              </p>
            </div>

            <div className="course-actions">
              <button
                className="btn-edit"
                onClick={() => openEditModal(course)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(course.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="no-courses">
          <p>No courses found. Add your first course!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? "Edit Course" : "Add New Course"}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Computer Science & Engineering"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div className="form-group">
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="BBA">BBA</option>
                    <option value="MBA">MBA</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Seats *</label>
                  <input
                    type="number"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Available Seats *</label>
                  <input
                    type="number"
                    name="available_seats"
                    value={formData.available_seats}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Fees (₹) *</label>
                <input
                  type="number"
                  name="course_fees"
                  value={formData.course_fees}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g., 120000"
                />
              </div>

              <div className="form-group">
                <label>Eligibility Criteria</label>
                <textarea
                  name="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={handleChange}
                  rows="4"
                  placeholder="e.g., 10+2 with PCM, Min 60%, JEE Main qualified"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCourse ? "Update Course" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;