import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:3000";

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return { days, hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

function Countdown() {
  // TODO: replace these two constants with the real details
  // Date set to 31st; update time when finalized
  const eventStartISO = "2026-05-31T19:16:30+05:30";
  const locationName = "Holiday Inn Chennai OMR";
  const mapsLink = "https://share.google/NOB8QTObfjbEclNRl"; 

  const target = useMemo(() => new Date(eventStartISO).getTime(), [eventStartISO]);
  const [now, setNow] = useState(Date.now());
  const [status, setStatus] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [emailHint, setEmailHint] = useState("Check your email for further instructions.");

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    if (!userID) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API}/get-status?id=${encodeURIComponent(userID)}`);
        const data = await res.json();
        if (!res.ok) return;
        if (cancelled) return;
        const s = data?.user?.status || "";
        setStatus(s);

        if (s === "PAYMENT_SUBMITTED") {
          setStatusMsg("Payment submitted. Waiting for admin verification.");
          setEmailHint("Check your email for further instructions (Entry QR will be emailed after verification).");
        } else if (s === "VERIFIED") {
          setStatusMsg("Verified. Your Entry QR has been emailed.");
          setEmailHint("Check your email for your Entry QR (single-use).");
        } else if (s === "PAYMENT_PENDING") {
          setStatusMsg("Payment pending. Complete payment and submit UTR + screenshot.");
          setEmailHint("After you submit payment details, check your email for further instructions.");
        } else {
          setStatusMsg("Registered.");
          setEmailHint("Proceed with payment and keep checking your email for updates.");
        }
      } catch {
        // ignore
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const diff = target - now;
  const t = formatDuration(diff);
  const started = diff <= 0;

  return (
    <div className="container">
      <div className="card">
        <h2>Countdown</h2>

        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.14)",
            background: "rgba(2,6,23,0.25)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Important</div>
          <div className="muted">
            <b>{emailHint}</b>
          </div>
          <div className="small muted" style={{ marginTop: 8 }}>
            {status ? (
              <>
                Status: <b>{status}</b> — {statusMsg}
              </>
            ) : (
              <>Status: <b>Unknown</b> — (register first to see live status here)</>
            )}
          </div>
        </div>

        {!started ? (
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>{t.days}</div>
              <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>DAYS</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>{t.hours}</div>
              <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>HRS</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>{t.minutes}</div>
              <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>MIN</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>{t.seconds}</div>
              <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>SEC</div>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 12 }}>
            <b>It’s party time.</b>
          </p>
        )}

        <p>
          <b>Location:</b>{" "}
          {mapsLink ? (
            <a href={mapsLink} target="_blank" rel="noreferrer">
              {locationName}
            </a>
          ) : (
            locationName
          )}
        </p>
      </div>
    </div>
  );
}

export default Countdown;

