import { useEffect, useMemo, useRef, useState } from "react";
import "./EventLanding.css";

/** Same registration flow as https://aurorenouvelle2026.netlify.app/ */
const REGISTER_URL = "https://erg.t-g.cc/p/87O2";
/** Holiday Inn Chennai — same short link as reference site */
const VENUE_MAPS_URL = "https://maps.app.goo.gl/FfJP2GEE1txBtnfx5";

/** Event start for countdown — May 31, 2026 1:00 PM IST. Override with REACT_APP_EVENT_ISO in `.env`. */
const EVENT_ISO = (process.env.REACT_APP_EVENT_ISO || "2026-05-31T13:00:00+05:30").trim();

/** Bundled background art in `public/landing-bg.png`. Set `REACT_APP_LANDING_BG_URL` to override. */
const PUBLIC_BASE = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
const DEFAULT_BG_URL = `${PUBLIC_BASE}/landing-bg.png`;
const LANDING_BG_URL_OVERRIDE = (process.env.REACT_APP_LANDING_BG_URL || "").trim();
const LANDING_BG_URL_EFFECTIVE =
  LANDING_BG_URL_OVERRIDE.length > 0 ? LANDING_BG_URL_OVERRIDE : DEFAULT_BG_URL;

function toParts(msRemaining) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function EventLanding() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const sparksRef = useRef([]);
  const eventDate = useMemo(() => new Date(EVENT_ISO), []);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const msRemaining = eventDate.getTime() - now;
  const parts = toParts(msRemaining);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let last = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(56, Math.floor((w * h) / 14000));
      const sparks = sparksRef.current;
      sparks.length = 0;
      for (let i = 0; i < target; i += 1) {
        sparks.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          r: Math.random() * 1.6 + 0.55,
          phase: Math.random() * Math.PI * 2,
          pulse: 0.018 + Math.random() * 0.035,
        });
      }
    }

    resize();
    window.addEventListener("resize", resize);

    function tick(t) {
      const dt = Math.min(48, t - last);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const sparks = sparksRef.current;
      for (let i = 0; i < sparks.length; i += 1) {
        const s = sparks[i];
        s.vx += (Math.random() - 0.5) * 0.09;
        s.vy += (Math.random() - 0.5) * 0.09;
        s.vx *= 0.988;
        s.vy *= 0.988;
        s.x += s.vx * (dt * 0.07);
        s.y += s.vy * (dt * 0.07);
        s.phase += s.pulse * dt * 0.001;

        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        const twinkle = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(s.phase + t * 0.0018));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 228, 170, ${twinkle * 0.78})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(255, 205, 110, 0.95)";
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${twinkle * 0.06})`;
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(tick);
    }

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rootStyle = {
    "--eventLandingPhotoUrl": `url("${LANDING_BG_URL_EFFECTIVE}")`,
  };

  return (
    <div className="eventLanding" style={rootStyle}>
      <div className="eventLanding__bg" aria-hidden="true">
        <div className="eventLanding__bgFill" />
        <div className="eventLanding__bgImage" />
        <div className="eventLanding__bgScrim" />
      </div>
      <canvas className="eventLanding__sparkles" ref={canvasRef} aria-hidden="true" />

      <main className="eventLanding__main">
        <h1 className="eventLanding__title eventLanding__goldScript eventLanding__aurore">Aurore Nouvelle</h1>
        <p className="eventLanding__year">2026</p>
        <h3 className="eventLanding__title eventLanding__goldScript eventLanding__sankara eventLanding__quoteLine">
          “A Night To Remember”
        </h3>

        <ul className="eventLanding__meta eventLanding__scriptFlow">
          <li>31 May 2026</li>
          <li>1:00 PM – 4:00 PM</li>
        </ul>

        <p className="eventLanding__come eventLanding__scriptFlow">
          Come join us here —{" "}
          <a href={VENUE_MAPS_URL} target="_blank" rel="noopener noreferrer">
            Holiday Inn, OMR, Chennai
          </a>
        </p>

        <div className="eventLanding__countdown" aria-live="polite">
          <span className="eventLanding__countUnit">
            <strong>{parts.days}</strong>
            <span>days</span>
          </span>
          <span className="eventLanding__countUnit">
            <strong>{pad2(parts.hours)}</strong>
            <span>hrs</span>
          </span>
          <span className="eventLanding__countUnit">
            <strong>{pad2(parts.minutes)}</strong>
            <span>min</span>
          </span>
          <span className="eventLanding__countUnit">
            <strong>{pad2(parts.seconds)}</strong>
            <span>sec</span>
          </span>
        </div>

        <a
          className="eventLanding__cta"
          href={REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          REGISTER NOW!!
        </a>
      </main>
    </div>
  );
}

export default EventLanding;
