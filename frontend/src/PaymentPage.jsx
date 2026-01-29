import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from './config';  
export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [courseName, setCourseName] = useState("");
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const [user, setUser] = useState(null);

  const addDebug = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${msg}`;
    console.log(logMsg);
    setDebugInfo(prev => [...prev, logMsg]);
  };

  useEffect(() => {
    const appId = searchParams.get("appId");
    const storedUser = localStorage.getItem("user");
    
    addDebug(`=== Payment Page Loaded ===`);
    addDebug(`URL: ${window.location.href}`);
    addDebug(`Application ID from URL: ${appId}`);
    
    if (!appId) {
      addDebug("❌ ERROR: No application ID in URL");
      alert("Invalid application ID - missing from URL");
      navigate("/student-dashboard");
      return;
    }
    
    if (!storedUser) {
      addDebug("❌ ERROR: No user in localStorage");
      alert("Please login first");
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setApplicationId(appId);
    addDebug(`✅ Application ID set to: ${appId}`);
    addDebug(`✅ User: ${parsedUser.name} (${parsedUser.email})`);
    
    // Fetch application data including course fees
    fetchApplicationData(appId);
    
    // Fetch Razorpay key
    fetchRazorpayKey();
  }, [searchParams, navigate]);

  const fetchApplicationData = async (appId) => {
    try {
      addDebug("Fetching application data from backend...");
      const response = await fetch(`${API_BASE_URL}/api/applications/${appId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch application data");
      }
      
      const data = await response.json();
      addDebug(`Application data received: ${JSON.stringify(data)}`);
      
      // Get course details to fetch fees
      if (data.course_preference_1) {
        addDebug(`Fetching course fees for course ID: ${data.course_preference_1}`);
        const courseResponse = await fetch(`${API_BASE_URL}/api/courses`);
        const courses = await courseResponse.json();
        
        const selectedCourse = courses.find(c => c.id === data.course_preference_1);
        
        if (selectedCourse) {
          const courseFees = parseFloat(selectedCourse.course_fees) || 0;
          setAmount(courseFees);
          setCourseName(selectedCourse.name);
          addDebug(`✅ Course Fees set to: ₹${courseFees}`);
          addDebug(`✅ Course Name: ${selectedCourse.name}`);
        } else {
          addDebug("⚠️ Course not found, using default amount");
          setAmount(25000);
          setCourseName("N/A");
        }
      } else {
        addDebug("⚠️ No course preference found, using default amount");
        setAmount(25000);
        setCourseName("N/A");
      }
      
      setLoadingData(false);
    } catch (error) {
      addDebug(`❌ Error fetching application data: ${error.message}`);
      alert("Failed to load application details. Using default amount.");
      setAmount(25000);
      setCourseName("N/A");
      setLoadingData(false);
    }
  };

  const fetchRazorpayKey = async () => {
    try {
      addDebug("Fetching Razorpay key from backend...");
      const response = await fetch('${API_BASE_URL}/api/payment/razorpay-key');
      const data = await response.json();
      
      if (data.key) {
        setRazorpayKey(data.key);
        addDebug(`✅ Razorpay key received: ${data.key.substring(0, 10)}...`);
      } else {
        addDebug("❌ No Razorpay key in response");
      }
    } catch (error) {
      addDebug(`❌ Error fetching Razorpay key: ${error.message}`);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        addDebug("✅ Razorpay SDK already loaded");
        resolve(true);
        return;
      }

      addDebug("Loading Razorpay SDK from CDN...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      
      script.onload = () => {
        addDebug("✅ Razorpay SDK loaded successfully");
        resolve(true);
      };
      
      script.onerror = () => {
        addDebug("❌ Failed to load Razorpay SDK");
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    addDebug("=== PAYMENT PROCESS STARTED ===");
    addDebug(`Application ID: ${applicationId}`);
    addDebug(`Amount: ₹${amount}`);

    if (!applicationId) {
      alert("Application ID not found");
      addDebug("❌ Application ID is null");
      return;
    }

    if (!user) {
      alert("User not logged in");
      addDebug("❌ User not found");
      return;
    }

    if (amount <= 0) {
      alert("Invalid amount. Please refresh and try again.");
      addDebug("❌ Amount is 0 or negative");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Load Razorpay SDK
      addDebug("Step 1: Loading Razorpay SDK...");
      const scriptLoaded = await loadRazorpayScript();
      
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Step 2: Create order
      addDebug("Step 2: Creating payment order...");
      addDebug(`POST to: ${API_BASE_URL}/api/payment/create-order`);
      
      const orderPayload = {
        applicationId: parseInt(applicationId),
        amount: amount
      };
      addDebug(`Payload: ${JSON.stringify(orderPayload)}`);

      const orderResponse = await fetch('${API_BASE_URL}/api/payment/create-order', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      addDebug(`Response status: ${orderResponse.status}`);
      
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        addDebug(`❌ Server error: ${errorText}`);
        throw new Error(errorText || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      addDebug(`✅ Order created: ${JSON.stringify(orderData)}`);

      if (!orderData.orderId) {
        throw new Error("No order ID received from server");
      }

      // Step 3: Open Razorpay checkout
      addDebug("Step 3: Initializing Razorpay checkout...");
      
      const options = {
        key: orderData.key || razorpayKey,
        amount: orderData.amount,
        currency: "INR",
        name: "College Admission Portal",
        description: `Admission Fee - ${courseName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          addDebug("=== PAYMENT SUCCESS CALLBACK ===");
          addDebug(`Order ID: ${response.razorpay_order_id}`);
          addDebug(`Payment ID: ${response.razorpay_payment_id}`);
          addDebug(`Signature: ${response.razorpay_signature?.substring(0, 20)}...`);

          try {
            addDebug("Step 4: Verifying payment...");
            
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              applicationId: parseInt(applicationId),
            };
            
            addDebug(`Verify payload: ${JSON.stringify(verifyPayload)}`);

            const verifyResponse = await fetch('${API_BASE_URL}/api/payment/verify', {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(verifyPayload),
            });

            addDebug(`Verify status: ${verifyResponse.status}`);
            
            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text();
              addDebug(`❌ Verification failed: ${errorText}`);
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            addDebug(`Verify response: ${JSON.stringify(verifyData)}`);

            if (verifyData.success) {
              addDebug("✅ PAYMENT COMPLETED SUCCESSFULLY!");
              alert("🎉 Payment Successful! Your admission is confirmed.");
              navigate("/student-dashboard");
            } else {
              throw new Error("Payment verification returned false");
            }
          } catch (error) {
            addDebug(`❌ Verification error: ${error.message}`);
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          applicationId: applicationId,
          courseName: courseName
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function() {
            addDebug("⚠️ Payment modal closed by user");
            setLoading(false);
          }
        }
      };

      addDebug(`Razorpay options: ${JSON.stringify({...options, key: options.key?.substring(0, 10) + '...'})}`);

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const razorpay = new window.Razorpay(options);
      
      razorpay.on("payment.failed", function (response) {
        addDebug(`❌ PAYMENT FAILED`);
        addDebug(`Error: ${JSON.stringify(response.error)}`);
        alert(`Payment Failed: ${response.error.description || "Unknown error"}`);
        setLoading(false);
      });

      addDebug("Opening Razorpay payment modal...");
      razorpay.open();
      
    } catch (error) {
      addDebug(`❌ CRITICAL ERROR: ${error.message}`);
      console.error("Payment error:", error);
      alert(`Failed to initiate payment: ${error.message}`);
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "40px auto", 
        padding: "20px",
        textAlign: "center"
      }}>
        <h2>Loading payment details...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "40px auto", 
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "30px",
        borderRadius: "10px",
        marginBottom: "30px"
      }}>
        <h2 style={{ margin: "0 0 10px 0" }}>💳 Admission Fee Payment</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Complete your admission process</p>
      </div>

      <div style={{
        background: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        padding: "30px",
        marginBottom: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#666", fontSize: "14px" }}>Application ID</label>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            #{applicationId || "Not found"}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#666", fontSize: "14px" }}>Student Name</label>
          <div style={{ fontSize: "18px", color: "#333" }}>
            {user?.name || "N/A"}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#666", fontSize: "14px" }}>Course</label>
          <div style={{ fontSize: "18px", color: "#333", fontWeight: "500" }}>
            {courseName || "N/A"}
          </div>
        </div>

        <div style={{ 
          borderTop: "2px dashed #e0e0e0", 
          paddingTop: "20px",
          marginTop: "20px"
        }}>
          <label style={{ color: "#666", fontSize: "14px" }}>Course Fees (Total Amount)</label>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#667eea" }}>
            ₹{amount.toLocaleString()}
          </div>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "5px" }}>
            * Amount fetched from course details
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={handlePay} 
          disabled={loading || !applicationId || !razorpayKey || amount <= 0}
          style={{
            flex: 1,
            padding: "15px 30px",
            fontSize: "18px",
            fontWeight: "bold",
            background: loading || !applicationId || !razorpayKey || amount <= 0
              ? "#ccc" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !applicationId || !razorpayKey || amount <= 0 ? "not-allowed" : "pointer",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => {
            if (!loading && applicationId && razorpayKey && amount > 0) {
              e.target.style.transform = "scale(1.02)";
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          {loading ? "Processing..." : !razorpayKey ? "Loading..." : `Pay ₹${amount.toLocaleString()}`}
        </button>
        
        <button 
          onClick={() => navigate("/student-dashboard")}
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            background: "white",
            color: "#666",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}