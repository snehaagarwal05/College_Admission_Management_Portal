import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
const AdmissionPayment = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`http://${API_BASE_URL}:5000/api/applications/${applicationId}`);
      const data = await res.json();
      
      if (data.selection_status !== 'selected') {
        alert('This application is not selected for admission');
        navigate('/');
        return;
      }
      
      setApplication(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Error loading application');
      navigate('/');
    }
  };

  const handlePayment = async () => {
    // Create Razorpay order
    const orderRes = await fetch("http://${API_BASE_URL}:5000/api/payment/create-admission-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId })
    });

    const order = await orderRes.json();

    const options = {
      key: "rzp_test_RwgFDs9MUgUeV0",
      amount: order.amount,
      currency: "INR",
      name: "TIE College",
      description: "Admission Fee Payment",
      order_id: order.id,
      handler: async function (response) {
        const verify = await fetch("http://${API_BASE_URL}:5000/api/payment/verify-admission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            applicationId
          }),
        });

        const result = await verify.json();

        if (result.success) {
          alert("🎉 Admission fee paid successfully! Your seat is confirmed.");
          navigate('/application-status');
        } else {
          alert("❌ Payment verification failed");
        }
      },
      theme: { color: "#0a1f44" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h1>🎓 Admission Fee Payment</h1>
      
      <div style={{ background: "#f5f7fa", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
        <h2 style={{ color: "#10b981" }}>🎉 Congratulations!</h2>
        <p>You have been selected for admission to <strong>{application.course_name}</strong></p>
        
        <hr />
        
        <p><strong>Student Name:</strong> {application.student_name}</p>
        <p><strong>Application ID:</strong> #{applicationId}</p>
        <p><strong>Admission Fee:</strong> ₹50,000</p>
        
        <hr />
        
        <p style={{ color: "#ef4444", fontWeight: "600" }}>
          ⚠️ Please pay admission fees within 7 days to confirm your seat!
        </p>
        
        <button
          onClick={handlePayment}
          style={{
            background: "#0a1f44",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "20px",
            width: "100%"
          }}
        >
          💳 Pay ₹50,000 Now
        </button>
      </div>
    </div>
  );
};

export default AdmissionPayment;