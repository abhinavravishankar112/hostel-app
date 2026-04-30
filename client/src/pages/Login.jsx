import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form)
      login(res.data.token, res.data.user)
      navigate('/browse')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        borderRight: '1px solid var(--border)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '-0.02em'
        }}>
          Hostel<span style={{ color: 'var(--accent)' }}>Match</span>
        </Link>

        <div>
          <span className="tag tag-accent" style={{ marginBottom: '16px', display: 'inline-block' }}>
            HOR 21A
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.03em'
          }}>
            Welcome<br />back.
          </h2>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
            Register
          </Link>
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <p style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '32px'
        }}>
          Step 01 — Login
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}