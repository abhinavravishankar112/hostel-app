import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './Requests.css'

export default function Requests() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomingRes, sentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/requests`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/sent`, { headers }),
        ])
        setRequests(incomingRes.data)
        setSentRequests(sentRes.data)
      } catch (err) {
        setError('Failed to load requests')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  // Find the accepted match from either direction
  const acceptedIncoming = requests.find(r => r.status === 'accepted')
  const acceptedSent = sentRequests.find(r => r.status === 'accepted')

  // The roommate is the other person in the match
  const match = acceptedIncoming
    ? { roommate: acceptedIncoming.from, matchedAt: acceptedIncoming.updatedAt }
    : acceptedSent
      ? { roommate: acceptedSent.to, matchedAt: acceptedSent.updatedAt }
      : null

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

        {/* ── Matched Roommate ── */}
        {match && (
          <div style={{ marginBottom: '48px' }}>
            <div className="match-header">
              <span className="tag tag-accent">MATCHED</span>
              <h2 className="match-title">Your Roommate</h2>
              {match.matchedAt && (
                <p className="match-date">
                  Matched on {new Date(match.matchedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              )}
            </div>

            <div
              className="match-card"
              onClick={() => navigate(`/profile/${match.roommate._id}`)}
            >
              <div className="match-card-inner">
                {/* Avatar */}
                <div className="match-avatar">
                  {match.roommate.profile?.profilePic ? (
                    <img
                      src={match.roommate.profile.profilePic}
                      alt={match.roommate.name}
                    />
                  ) : (
                    <span className="match-avatar-letter">
                      {match.roommate.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="match-info">
                  <div className="match-info-top">
                    <h3 className="match-name">{match.roommate.name}</h3>
                    {match.roommate.profile?.year && (
                      <span className="match-year">Y{match.roommate.profile.year}</span>
                    )}
                  </div>

                  {match.roommate.profile?.course && (
                    <p className="match-course">{match.roommate.profile.course}</p>
                  )}

                  {/* Tags */}
                  <div className="match-tags">
                    {match.roommate.profile?.sleepSchedule && (
                      <span className="tag">{match.roommate.profile.sleepSchedule}</span>
                    )}
                    {match.roommate.profile?.socialStyle && (
                      <span className="tag">{match.roommate.profile.socialStyle}</span>
                    )}
                    {match.roommate.profile?.studyHabits && (
                      <span className="tag">{match.roommate.profile.studyHabits}</span>
                    )}
                  </div>

                  {/* Hobbies */}
                  {match.roommate.profile?.hobbies?.length > 0 && (
                    <p className="match-hobbies">
                      {match.roommate.profile.hobbies.join(', ')}
                    </p>
                  )}

                  {/* Instagram */}
                  {match.roommate.profile?.instagram && (
                    <p className="match-instagram">
                      {match.roommate.profile.instagram}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <span className="match-arrow">→</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Pending Requests ── */}
        {pending.length === 0 && !match && (
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
          <div>
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
      </div>
    </>
  )
}