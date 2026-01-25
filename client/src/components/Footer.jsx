import React from "react";

function Footer() {
    return(
        <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Column 1 */}
        <div style={styles.brandColumn}>
          <Link to="/" style={styles.logo}>
            Eventify
          </Link>
          <span style={styles.tagline}>
            A safe and secure platform for organizing events and registering oneself for events.
          </span>
        </div>

        {/* Column 2 */}
        <div style={styles.linksColumn}>
          <span style={styles.columnTitle}>Quick Links</span>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/events">Events</FooterLink>
          <FooterLink to="/support">Support</FooterLink>
        </div>

        {/* Column 3 */}
        <div style={styles.linksColumn}>
          <span style={styles.columnTitle}>Legal</span>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/cookie">Cookie Policy</FooterLink>
        </div>
      </div>

      <div style={styles.divider}></div>

      <div style={styles.bottomBar}>
        <span>© 2026 Eventify. All rights reserved.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ cursor: "pointer" }}>Twitter</span>
          <span style={{ cursor: "pointer" }}>LinkedIn</span>
          <span style={{ cursor: "pointer" }}>Instagram</span>
        </div>
      </div>
    </footer>
  );
}

// Helper Component for Links with Hover Effect
function FooterLink({ to, children }) {
  const [hover, setHover] = useState(false);

  const style = {
    color: hover ? "#a0f1bd" : "#ffffff",
    textDecoration: "none",
    fontSize: "16px",
    opacity: hover ? 1 : 0.8,
    transition: "all 0.2s ease",
    cursor: "pointer",
    width: "fit-content",
  };

  return (
    <Link
      to={to}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}