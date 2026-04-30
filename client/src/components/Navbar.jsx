import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/browse" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }}>
        Hostel<span style={{ color: 'var(--accent)' }}>Match</span>
      </Link>

      <div className="navbar-links">
        <Link
          to="/browse"
          className={location.pathname === '/browse' ? 'active' : ''}
        >
          Browse
        </Link>
        <Link
          to="/requests"
          className={location.pathname === '/requests' ? 'active' : ''}
        >
          Requests
        </Link>
        <Link
          to="/me"
          className={location.pathname === '/me' ? 'active' : ''}
        >
          Profile
        </Link>
        <button
          onClick={handleLogout}
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            transition: 'color 0.2s',
            padding: 0
          }}
          onMouseEnter={e => e.target.style.color = 'var(--danger)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}