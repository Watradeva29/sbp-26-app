import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

function AdminLogin() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!adminId.trim() || !password) {
      setMessage("Enter admin ID and password");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: adminId.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data?.token) {
        setMessage(data?.error || "Login failed");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminId", adminId.trim().toUpperCase());
      navigate("/admin");
    } catch (err) {
      setMessage("Login error (is backend running?)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: 6 }}>Admin Login</h2>
        <p className="small muted" style={{ textAlign: "center" }}>
          Use the admin credentials from backend `.env` (`ADMIN_USERS`).
        </p>
        <form onSubmit={handleLogin}>
          <input
            placeholder="Admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value.toUpperCase())}
            autoCapitalize="characters"
          />
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                width: "auto",
                marginTop: 0,
                padding: "12px 12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default AdminLogin;

