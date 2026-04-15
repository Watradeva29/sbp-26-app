import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

function Admin() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actionBusyId, setActionBusyId] = useState("");

  const token = localStorage.getItem("adminToken");
  const adminId = localStorage.getItem("adminId") || "";

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadPending = async () => {
    setMessage("");
    setLoadingPending(true);
    try {
      const res = await fetch(`${API}/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to load pending list");
        setPending([]);
        return;
      }
      setPending(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      setMessage("Error loading pending list");
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const loadStatus = async () => {
    setMessage("");
    setUser(null);
    if (!id.trim()) return;

    try {
      const res = await fetch(`${API}/get-status?id=${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Not found");
        return;
      }
      setUser(data.user);
    } catch (err) {
      setMessage("Error loading status");
    }
  };

  const verifyAndSendQr = async (targetId) => {
    setMessage("");
    try {
      const cleanId = String(targetId || id).trim();
      if (!cleanId) {
        setMessage("Enter an ID first");
        return;
      }
      setActionBusyId(cleanId);
      const res = await fetch(`${API}/admin/verify-and-send-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: cleanId, adminId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed");
        return;
      }
      setMessage(data?.message || "Done");
      setUser(data.user || null);
      await loadPending();
    } catch (err) {
      setMessage("Error verifying");
    } finally {
      setActionBusyId("");
    }
  };

  const resendQr = async (targetId) => {
    setMessage("");
    try {
      const cleanId = String(targetId || id).trim();
      if (!cleanId) {
        setMessage("Enter an ID first");
        return;
      }
      setActionBusyId(cleanId);
      const res = await fetch(`${API}/admin/resend-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: cleanId, adminId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to resend");
        return;
      }
      setMessage(data?.message || "Re-sent");
      setUser(data.user || null);
      await loadPending();
    } catch (err) {
      setMessage("Error resending");
    } finally {
      setActionBusyId("");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Admin</h2>
          <button onClick={logout} style={{ width: "auto", marginTop: 0, padding: "10px 12px" }}>Logout</button>
        </div>

        <p style={{ marginTop: 8 }}>
          Logged in as <b>{adminId || "?"}</b>
        </p>

        <div style={{ marginTop: 14 }} className="pill">
          <span className="small muted">Pending verifications</span>
          <b className="small">{loadingPending ? "…" : pending.length}</b>
          <button
            onClick={loadPending}
            disabled={loadingPending}
            style={{ width: "auto", marginTop: 0, marginLeft: "auto", padding: "8px 10px" }}
          >
            Refresh
          </button>
        </div>

        <div className="row" style={{ marginTop: 10, justifyContent: "flex-end" }}>
          <a
            className="small"
            href={`${API}/admin/export.csv`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              // keep token in query via header? (not possible). We'll open via fetch instead.
              e.preventDefault();
            }}
            style={{ display: "none" }}
          >
            Export CSV
          </a>
          <button
            onClick={async () => {
              setMessage("");
              try {
                const res = await fetch(`${API}/admin/export.csv`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  setMessage(data?.error || "Export failed");
                  return;
                }
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `sbp_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch {
                setMessage("Export error");
              }
            }}
            style={{
              width: "auto",
              marginTop: 0,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(148,163,184,0.18)",
            }}
          >
            Export CSV (backup)
          </button>
        </div>

        {pending.length > 0 && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {pending.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.14)",
                  background: "rgba(2,6,23,0.25)",
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <b>{p.id}</b>{" "}
                    <span className="muted small">— {p.name}</span>
                    <div className="muted small">{p.email}</div>
                    <div className="muted small">UTR: <b>{p.utr || "-"}</b></div>
                  </div>
                  <div style={{ display: "grid", gap: 8, minWidth: 180 }}>
                    <button
                      onClick={() => verifyAndSendQr(p.id)}
                      disabled={actionBusyId === p.id}
                      style={{ marginTop: 0 }}
                    >
                      {actionBusyId === p.id ? "Working…" : "Verify + Send QR"}
                    </button>
                    <button
                      onClick={() => {
                        setId(p.id);
                        setUser(p);
                      }}
                      style={{
                        marginTop: 0,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(148,163,184,0.18)",
                      }}
                    >
                      Open details
                    </button>
                  </div>
                </div>

                {p.screenshot && (
                  <div className="small muted" style={{ marginTop: 10 }}>
                    Screenshot:{" "}
                    <a href={p.screenshot} target="_blank" rel="noreferrer">
                      open
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          placeholder="Enter SBP ID (e.g., SBP26-004)"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={loadStatus} style={{ flex: 1, minWidth: 160 }}>Check Status</button>
          <button
            onClick={() => verifyAndSendQr()}
            disabled={actionBusyId === String(id || "").trim()}
            style={{ flex: 1, minWidth: 160 }}
          >
            Verify + Send Entry QR
          </button>
          <button
            onClick={() => resendQr()}
            disabled={actionBusyId === String(id || "").trim()}
            style={{
              flex: 1,
              minWidth: 160,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(148,163,184,0.18)",
            }}
          >
            Resend Entry QR
          </button>
        </div>

        {user && (
          <div style={{ marginTop: 12 }}>
            <p>
              <b>{user.id}</b> — {user.name} — {user.email}
            </p>
            <p>
              <b>Status:</b> {user.status}
            </p>
            <p>
              <b>UTR:</b> {user.utr || "-"}
            </p>
            <p>
              <b>Screenshot:</b> {user.screenshot ? <a href={user.screenshot}>Open</a> : "-"}
            </p>
          </div>
        )}

        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}

export default Admin;

