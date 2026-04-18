import { useMemo, useEffect, useState, useCallback, useRef } from "react";

// Add `REACT_APP_BOOKING_URL=https://...` to `.env` in this folder (then restart `npm start`).
const BOOKING_URL = (process.env.REACT_APP_BOOKING_URL || "").trim();
/* Default: May 31, 4:30 PM IST — override with REACT_APP_EVENT_ISO in `.env` */
const EVENT_ISO = (process.env.REACT_APP_EVENT_ISO || "2026-05-31T16:30:00+05:30").trim();

/** Out fade duration — keep in sync with CSS --story-fade-ms */
const FADE_MS = 620;
/** Extra delay after swapping slide HTML so opacity-0 paints before fade-in (avoids skipped transitions). */
const FADE_IN_GAP_MS = 48;
const LAST_SLIDE = 6;

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

function formatName(raw) {
  const t = (raw || "").trim();
  if (!t) return "friend";
  return t
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function Invite() {
  const year = 2026;
  const logoUrl = "";

  const [slide, setSlide] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const panelWrapRef = useRef(null);
  const fadeTimersRef = useRef({ out: null, inn: null });

  useEffect(() => {
    return () => {
      window.clearTimeout(fadeTimersRef.current.out);
      window.clearTimeout(fadeTimersRef.current.inn);
    };
  }, []);

  const eventDate = useMemo(() => new Date(EVENT_ISO), []);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const msRemaining = eventDate.getTime() - now;
  const parts = toParts(msRemaining);
  const hasStarted = msRemaining <= 0;

  const displayName = formatName(guestName);

  const goNext = useCallback(() => {
    if (fadeOut) return;
    if (slide >= LAST_SLIDE) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setSlide((s) => Math.min(s + 1, LAST_SLIDE));
      return;
    }
    window.clearTimeout(fadeTimersRef.current.out);
    window.clearTimeout(fadeTimersRef.current.inn);
    setFadeOut(true);
    fadeTimersRef.current.out = window.setTimeout(() => {
      setSlide((s) => Math.min(s + 1, LAST_SLIDE));
      /* Separate macrotask after slide commit so the wrapper stays at opacity 0 for one paint, then fades in */
      fadeTimersRef.current.inn = window.setTimeout(() => {
        if (panelWrapRef.current) {
          void panelWrapRef.current.offsetHeight;
        }
        setFadeOut(false);
      }, FADE_IN_GAP_MS);
    }, FADE_MS);
  }, [fadeOut, slide]);

  const openBooking = () => {
    if (!BOOKING_URL) return;
    window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
  };

  const startStory = () => {
    const name = guestName.trim();
    if (!name) return;
    goNext();
  };

  const onStagePointer = (e) => {
    if (slide === 0) return;
    if (slide >= LAST_SLIDE) return;
    const t = e.target;
    if (t.closest("button, a, input, textarea, label")) return;
    goNext();
  };

  const onStageKeyDown = (e) => {
    if (slide === 0 || slide >= LAST_SLIDE) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div className="invitePage" style={logoUrl ? { "--inviteLogoUrl": `url(${logoUrl})` } : undefined}>
      <div className="inviteAtmosphere" aria-hidden="true">
        <span className="inviteOrb inviteOrbA" />
        <span className="inviteOrb inviteOrbB" />
        <span className="inviteOrb inviteOrbC" />
        <span className="inviteNoise" />
      </div>
      <div className="inviteLogoBackdrop" aria-hidden="true" />

      <div className="inviteStoryRoot">
        <div className="storyDots" aria-hidden="true">
          {Array.from({ length: LAST_SLIDE + 1 }, (_, i) => (
            <span key={i} className={`storyDot ${i === slide ? "storyDot--active" : ""}`} />
          ))}
        </div>

        <main
          className="storyStage"
          role="presentation"
          tabIndex={slide > 0 && slide < LAST_SLIDE ? 0 : undefined}
          onClick={onStagePointer}
          onKeyDown={onStageKeyDown}
        >
          <div
            ref={panelWrapRef}
            className={`storyPanelWrap ${fadeOut ? "storyPanelWrap--exit" : "storyPanelWrap--enter"}`}
            style={{ "--story-fade-ms": `${FADE_MS}ms` }}
          >
            <div key={slide} className="storyPanelInner inviteSection storySlideContent">
              {slide === 0 && (
                <>
                  <p className="inviteStoryKicker">Sankara Batch Party -26</p>
                  <h1 className="inviteTitle inviteGlowText storyBrandTitle">You’re invited</h1>
                  <p className="inviteStoryLead">
                    Tell us your name — we’ll personalize your invite for this story.
                  </p>
                  <label className="inviteNameLabel" htmlFor="guest-name">
                    Your name
                  </label>
                  <input
                    id="guest-name"
                    name="guest-name"
                    type="text"
                    autoComplete="given-name"
                    className="inviteNameInput"
                    placeholder="First name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="invitePrimary inviteBtn storyContinueBtn"
                    disabled={!guestName.trim()}
                    onClick={(e) => {
                      e.stopPropagation();
                      startStory();
                    }}
                  >
                    Continue
                  </button>
                </>
              )}

              {slide === 1 && (
                <>
                  <p className="inviteDear">Dear {displayName},</p>
                  <p className="inviteStoryLead">
                    We’re so glad you’re here. We invite you to{" "}
                    <strong>Sankara Batch Party ’26</strong> — one last evening with everyone who shaped our
                    school days.
                  </p>
                  <p className="inviteSectionText storyMutedCenter">
                    Save the date, bring your smiles, and walk in like the batch never left.
                  </p>
                </>
              )}

              {slide === 2 && (
                <>
                  <h2 className="inviteSectionTitle inviteGlowText storySlideHeading">One last time</h2>
                  <p className="inviteSectionText storyCenterPara">
                    With friends beside you — laughing, cheering, enjoying the evening — moments that feel like home,
                    lights low and memories high.
                  </p>
                </>
              )}

              {slide === 3 && (
                <>
                  <h2 className="inviteSectionTitle inviteGlowText">The memories we unlocked</h2>
                  <p className="inviteSectionText">
                    From assemblies to last-bench conversations, we collected moments that shaped us. This is one more
                    moment to add to that story.
                  </p>
                </>
              )}

              {slide === 4 && (
                <>
                  <h2 className="inviteSectionTitle inviteGlowText">The friendships we made</h2>
                  <p className="inviteSectionText">
                    Different classes, different paths — one shared timeline. Let’s meet again, take pictures, and
                    celebrate how far we’ve come.
                  </p>
                </>
              )}

              {slide === 5 && (
                <>
                  <h2 className="inviteSectionTitle inviteGlowText">We unite one last time</h2>
                  <p className="inviteSectionText">
                    Tickets and confirmations are handled on our booking page — you’ll get details automatically after
                    you complete the steps there.
                  </p>
                </>
              )}

              {slide === 6 && (
                <>
                  <h2 className="inviteSectionTitle inviteGlowText">{hasStarted ? "We’re here!" : "Countdown"}</h2>
                  <p className="inviteSectionText inviteCountdownLocation">
                    <strong>Holiday Inn Chennai OMR</strong>
                  </p>
                  <div className="inviteCountdownRow">
                    <span className="inviteCountUnit">
                      <strong>{parts.days}</strong>
                      <span>days</span>
                    </span>
                    <span className="inviteCountUnit">
                      <strong>{pad2(parts.hours)}</strong>
                      <span>hrs</span>
                    </span>
                    <span className="inviteCountUnit">
                      <strong>{pad2(parts.minutes)}</strong>
                      <span>min</span>
                    </span>
                    <span className="inviteCountUnit">
                      <strong>{pad2(parts.seconds)}</strong>
                      <span>sec</span>
                    </span>
                  </div>
                  <div className="inviteMetaRow storyMetaCompact">
                    <div className="inviteMetaPill">
                      <span className="inviteMetaLabel">Year</span>
                      <span className="inviteMetaValue">{year}</span>
                    </div>
                  </div>

                  <div className="storyFinalDivider" aria-hidden="true" />

                  <h2 className="inviteSectionTitle inviteGlowText storyJoinHeading">Ready to join us?</h2>
                  <p className="inviteSectionText storyMutedCenter">
                    Tap below to book your spot — then we’ll see you there, {displayName}.
                  </p>
                  <button
                    type="button"
                    className="invitePrimary inviteBtn storyBookBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking();
                    }}
                    disabled={!BOOKING_URL}
                    title={BOOKING_URL ? "Opens booking in a new tab" : "Set REACT_APP_BOOKING_URL in .env"}
                  >
                    Book your spot
                  </button>
                  {!BOOKING_URL ? (
                    <p className="inviteBookingHint muted">
                      Admins: set <code>REACT_APP_BOOKING_URL</code> in <code>.env</code> before build.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </main>

        {slide === 0 ? (
          <p className="storyTapHint">Enter your name and tap Continue</p>
        ) : slide < LAST_SLIDE ? (
          <p className="storyTapHint">Tap anywhere to continue</p>
        ) : (
          <p className="storyTapHint storyTapHint--final">Countdown above — book your spot when you’re ready.</p>
        )}
      </div>
    </div>
  );
}

export default Invite;
