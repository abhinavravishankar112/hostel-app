import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/browse')
  }, [token])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 40px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <span className="tag tag-accent">HOR 21A</span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(48px, 8vw, 96px)',
        fontWeight: 800,
        lineHeight: 0.95,
        letterSpacing: '-0.03em',
        marginBottom: '32px'
      }}>
        Find your<br />
        <span style={{ color: 'var(--accent)' }}>roommate.</span>
      </h1>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '15px',
        lineHeight: 1.7,
        maxWidth: '420px',
        marginBottom: '48px'
      }}>
        Browse profiles of students assigned to your hostel.
        Send a request. Get matched before move-in day.
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/register">
          <button className="btn-primary">Register</button>
        </Link>
        <Link to="/login">
          <button className="btn-ghost">Login</button>
        </Link>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '32px',
        right: '40px',
        color: 'var(--text-muted)',
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        University Hostel Matching
      </div>
    </div>
  )
}