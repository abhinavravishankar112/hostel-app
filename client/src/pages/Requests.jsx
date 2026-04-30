import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Requests() {
  const { token } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/matches/requests`,
          { headers }
        )
        setRequests(res.data)
      } catch (err) {
        setError('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [headers])

  const handleAccept = async (requestId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/matches/accept/${requestId}`,
        {},
        { headers }
      )
      setRequests(requests.map(r =>
        r._id === requestId ? { ...r, status: 'accepted' } : r
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/matches/reject/${requestId}`,
        {},
        { headers }
      )
      setRequests(requests.filter(r => r._id !== requestId))
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="page" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className="page" style={{ color: 'var(--danger)' }}>{error}</div>
    </>
  )

  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '40px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1
          }}>
            Requests
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            {pending.length} pending
          </p>
        </div>

        <hr className="divider" />

        {/* Pending requests */}
        {pending.length === 0 && accepted.length === 0 && (
          <div style={{
            border: '1px dashed var(--border)',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              No incoming requests yet.
            </p>
          </div>
        )}

        {pending.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}>
              Pending
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              background: 'var(--border)',
              border: '1px solid var(--border)'
            }}>
              {pending.map(request => (
                <div
                  key={request._id}
                  style={{
                    background: 'var(--bg)',
                    padding: '24px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px'
                  }}
                >
                  {/* Sender info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      marginBottom: '4px'
                    }}>
                      {request.from.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {request.from.profile?.course
                        ? `${request.from.profile.course}${request.from.profile?.year ? ` · Year ${request.from.profile.year}` : ''}`
                        : 'No course info'
                      }
                    </p>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {request.from.profile?.sleepSchedule && (
                      <span className="tag">{request.from.profile.sleepSchedule}</span>
                    )}
                    {request.from.profile?.socialStyle && (
                      <span className="tag">{request.from.profile.socialStyle}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleAccept(request._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleReject(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted requests */}
        {accepted.length > 0 && (
          <div>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}>
              Matched
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              background: 'var(--border)',
              border: '1px solid var(--border)'
            }}>
              {accepted.map(request => (
                <div
                  key={request._id}
                  style={{
                    background: 'var(--bg)',
                    padding: '24px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      marginBottom: '4px'
                    }}>
                      {request.from.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {request.from.profile?.course || 'No course info'}
                    </p>
                  </div>
                  <span className="tag tag-accent">Matched</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}