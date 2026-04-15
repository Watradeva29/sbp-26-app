import React, { useMemo, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

function Payment() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [utr, setUtr] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("qr");

  // Generate payment when page loads
  useEffect(() => {
    const generatePayment = async () => {
      await fetch(`${API}/generate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: userID })
      });

      console.log("Payment generated");
    };

    generatePayment();
  }, [userID]);

  const upiId = "9551380704@ptaxis";
  const payeeName = "SBP 2026";
  const amount = 1;

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: String(amount),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [upiId, payeeName, amount]);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!utr || !file) {
      setMessage("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("id", userID);
    formData.append("utr", utr);
    formData.append("screenshot", file);

    try {
      const res = await fetch(`${API}/submit-payment`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setMessage(data.message || "Submitted");
      if (res.ok) {
        setTimeout(() => navigate("/countdown"), 1200);
      }
    } catch (err) {
      setMessage("Error submitting");
    }
  };

  return (
    <div>
      <h2>Payment</h2>

      {step === "qr" && (
        <div>
          <h3>Pay via UPI</h3>

          <p><b>UPI ID:</b> {upiId}</p>
          <p><b>Amount:</b> ₹{amount}</p>
          <p>
            After you submit UTR + screenshot, the <b>entry QR</b> will be emailed once an admin verifies.
          </p>

          {isMobile ? (
            <a href={upiLink}>
              <button>Pay Now</button>
            </a>
          ) : (
            <div>
              <p>Scan this QR using any UPI app</p>
              <QRCodeCanvas value={upiLink} size={220} />
            </div>
          )}

          <br /><br />

          <button onClick={() => setStep("form")}>
            I have paid
          </button>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter UTR"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit">Submit Payment</button>
        </form>
      )}

      <p>{message}</p>
    </div>
  );
}

export default Payment;