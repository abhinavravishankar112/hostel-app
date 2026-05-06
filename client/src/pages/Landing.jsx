import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Landing.css'

export default function Landing() {
  const { token } = useAuth()

  return (
    <div className="landing-root">
      {/* Nav — shows full app nav if logged in, minimal if not */}
      {token ? (
        <Navbar />
      ) : (
        <header className="landing-nav">
          <span className="landing-nav-logo">
            Hostel<span>Match</span>
          </span>
          <div className="landing-nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">
              <button className="btn-primary">Register</button>
            </Link>
          </div>
        </header>
      )}

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <span className="tag tag-accent" style={{ marginBottom: '24px', display: 'inline-block' }}>
            HOR 21A · University Hostel
          </span>
          <h1 className="landing-h1">
            Find your<br />
            <span className="landing-h1-accent">roommate.</span>
          </h1>
          <p className="landing-sub">
            Browse every student in your hostel. See how your habits align.
            Send a request. Get matched before move-in day.
          </p>
          <div className="landing-ctas">
            {token ? (
              <Link to="/browse">
                <button className="btn-primary landing-cta-primary">Browse Members →</button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="btn-primary landing-cta-primary">Get Started</button>
                </Link>
                <Link to="/login">
                  <button className="btn-ghost">Login</button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative grid */}
        <div className="landing-grid-bg" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="landing-grid-cell" />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <p className="landing-section-label">How it works</p>
          <div className="landing-steps">
            {[
              { n: '01', title: 'Create your profile', desc: 'Fill in your sleep schedule, study habits, social style, and hobbies so others know what living with you is actually like.' },
              { n: '02', title: 'Browse your hostel', desc: 'See every student assigned to your hostel. Filter by year, sleep schedule, or social style to find compatible matches.' },
              { n: '03', title: 'Send a request', desc: 'Found someone you vibe with? Send them a roommate request. They get notified and can accept or decline.' },
              { n: '04', title: 'Get matched', desc: 'Once they accept, you\'re matched. Their contact details appear and you can coordinate before move-in day.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="landing-step">
                <span className="landing-step-n">{n}</span>
                <h3 className="landing-step-title">{title}</h3>
                <p className="landing-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <p className="landing-section-label">Why it works</p>
          <div className="landing-features">
            {[
              { icon: '◈', title: 'Hostel-scoped', desc: 'You only see students in your assigned hostel — no noise from the rest of campus.' },
              { icon: '◉', title: 'Habit-first profiles', desc: 'Sleep schedule, study habits, and social style front and centre — the things that actually matter when you share a room.' },
              { icon: '◇', title: 'One match at a time', desc: 'Once matched, neither of you can accept another request. No awkward double-bookings.' },
              { icon: '⊹', title: 'Request flow', desc: 'Both sides have to agree. No one gets matched without consenting — no surprises on move-in day.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="landing-feature">
                <span className="landing-feature-icon">{icon}</span>
                <h3 className="landing-feature-title">{title}</h3>
                <p className="landing-feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="landing-footer-cta">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <h2 className="landing-footer-title">Ready to find your roommate?</h2>
          <p className="landing-footer-sub">
            Your hostel. Your match. No randomness.
          </p>
          {token ? (
            <Link to="/browse">
              <button className="btn-primary landing-cta-primary">Go to Browse →</button>
            </Link>
          ) : (
            <Link to="/register">
              <button className="btn-primary landing-cta-primary">Create Account</button>
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span>Hostel<span style={{ color: 'var(--accent)' }}>Match</span></span>
        <span>University Hostel Matching System</span>
      </footer>
    </div>
  )
}