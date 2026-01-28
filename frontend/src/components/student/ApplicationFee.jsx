import React from "react";
import { useParams } from "react-router-dom";

const ApplicationFee = () => {
  const { id } = useParams(); // application id from URL

  const payNow = async () => {
    const res = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
    });

    const order = await res.json();

    const options = {
      key: "rzp_test_RwgFDs9MUgUeV0",
      amount: order.amount,
      currency: "INR",
      name: "TIE College",
      description: "Admission Application Fee",
      order_id: order.id,
      handler: async function (response) {
        const verify = await fetch(
          "http://localhost:5000/api/payment/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          }
        );

        const result = await verify.json();

        if (result.success) {
          alert("✅ Payment successful! Your application is now complete.");

            // 🔹 NEW: Generate receipt
            const receiptRes = await fetch(
              "http://localhost:5000/api/payment/pay",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  applicationId: id,
                  amount: 100,
                }),
              }
            );

            const receiptData = await receiptRes.json();

            if (receiptData.success) {
              window.open(
                `http://localhost:5000/receipts/${receiptData.receiptFile}`,
                "_blank"
              );
            }
          } else {
            alert("❌ Payment verification failed");
          }
      },
      theme: {
        color: "#0a1f44",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h1>🎓 Application Fee Payment</h1>

      <div
        style={{
          background: "#f5f7fa",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p><strong>College:</strong> TIE College</p>
        <p><strong>Application ID:</strong> #{id}</p>
        <p><strong>Fee Amount:</strong> ₹100</p>
        <p><strong>Purpose:</strong> Admission Application Processing</p>

        <hr />

        <button
          onClick={payNow}
          style={{
            background: "#0a1f44",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          💳 Pay ₹100 Now
        </button>
      </div>
    </div>
  );
};

export default ApplicationFee;