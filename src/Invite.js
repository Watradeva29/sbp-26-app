import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

function Invite() {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef(null);
  const year = 2026;

  // ===== PLACEHOLDERS (replace with your local/static paths) =====
  // Recommended: put files under `sbp_26-frontend/public/assets/...`
  // Then use paths like: "/assets/logo.png", "/assets/gallery/1.jpg"
  const logoUrl = ""; // e.g. "/assets/school-logo.png"

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleHiddenAdminTap = () => {
    setTapCount((c) => c + 1);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setTapCount(0), 1500);

    // 5 quick taps opens admin login
    if (tapCount + 1 >= 5) {
      setTapCount(0);
      navigate("/admin/login");
    }
  };

  const gallery = useMemo(
    () => [
      { label: "School days", hint: "Add your group photo here", src: "" }, // "/assets/gallery/school-1.jpg"
      { label: "Class moments", hint: "Add your classroom photo here", src: "" }, // "/assets/gallery/class-1.jpg"
      { label: "One last time", hint: "Add farewell day photo here", src: "" }, // "/assets/gallery/farewell-1.jpg"
    ],
    []
  );

  return (
    <div className="invitePage" style={logoUrl ? { "--inviteLogoUrl": `url(${logoUrl})` } : undefined}>
      <div
        onClick={handleHiddenAdminTap}
        className="inviteAdminHotspot"
        aria-hidden="true"
      />

      <div className="inviteLogoBackdrop" aria-hidden="true" />

      <header className="inviteHero">
        <div className="inviteHeroTopRow">
          <button type="button" onClick={handleHiddenAdminTap} className="inviteAdminButton">
            Admin
          </button>
        </div>

        <p className="inviteKicker">Sankara</p>
        <h1 className="inviteTitle">Sankara Batch Party -26</h1>
        <p className="inviteSubtitle">
          The memories we unlocked. The friendships we made. The laugh-until-it-hurts moments we’ll never
          forget.
        </p>

        <div className="inviteCtas">
          <button className="invitePrimary" onClick={() => navigate("/register")}>
            Register now
          </button>
          <button className="inviteSecondary" onClick={() => document.getElementById("inviteStory")?.scrollIntoView({ behavior: "smooth" })}>
            See the story
          </button>
        </div>

        <div className="inviteMetaRow">
          <div className="inviteMetaPill">
            <span className="inviteMetaLabel">Year</span>
            <span className="inviteMetaValue">{year}</span>
          </div>
          <div className="inviteMetaPill">
            <span className="inviteMetaLabel">Location</span>
            <span className="inviteMetaValue">Holiday Inn Chennai OMR</span>
          </div>
        </div>
      </header>

      <main className="inviteContent" id="inviteStory">
        <section className="inviteSection">
          <h2 className="inviteSectionTitle">The memories we unlocked</h2>
          <p className="inviteSectionText">
            From assemblies to last-bench conversations, we collected moments that shaped us. This is one
            more moment to add to that story.
          </p>
        </section>

        <section className="inviteSection">
          <h2 className="inviteSectionTitle">The friendships we made</h2>
          <p className="inviteSectionText">
            Different classes, different paths—one shared timeline. Let’s meet again, take pictures, and
            celebrate how far we’ve come.
          </p>
        </section>

        <section className="inviteSection">
          <h2 className="inviteSectionTitle">We unite one last time</h2>
          <p className="inviteSectionText">
            Register to take part in the farewell meet. Payment confirmation is required, and your entry
            QR will be emailed after admin verification.
          </p>
        </section>

        <section className="inviteSection">
          <h2 className="inviteSectionTitle">A glimpse of us</h2>
          <div className="inviteGallery">
            {gallery.map((g) => (
              <div key={g.label} className="inviteGalleryCard">
                {g.src ? (
                  <img className="inviteGalleryImg" src={g.src} alt={g.label} loading="lazy" />
                ) : (
                  <div className="inviteGalleryImg inviteGalleryImgPlaceholder" aria-hidden="true" />
                )}
                <div className="inviteGalleryBody">
                  <div className="inviteGalleryLabel">{g.label}</div>
                  <div className="inviteGalleryHint">{g.hint}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="inviteSectionFootnote">Images are placeholders — paste your local/static paths into `logoUrl` and `gallery[].src`.</p>
        </section>

        <section className="inviteFinalCta">
          <h2 className="inviteSectionTitle">Ready?</h2>
          <p className="inviteSectionText">Tap below to register and reserve your place.</p>
          <button className="invitePrimary" onClick={() => navigate("/register")}>
            Click here to register
          </button>
        </section>
      </main>
    </div>
  );
}

export default Invite;

