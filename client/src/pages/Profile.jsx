import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Profile() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [member, setMember] = useState(null)
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
        const [memberRes, incomingRes, sentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/requests`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/sent`, { headers }),
        ])
        setMember(memberRes.data)
        setRequests(incomingRes.data)
        setSentRequests(sentRes.data)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, headers])

  const sendRequest = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/matches/request/${id}`,
        {},
        { headers }
      )
      setSentRequests([...sentRequests, res.data])
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const acceptRequest = async (requestId) => {
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

  const unmatchRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to unmatch?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/matches/unmatch/${requestId}`,
        { headers }
      )
      setRequests(requests.filter(r => r._id !== requestId))
      setSentRequests(sentRequests.filter(r => r._id !== requestId))
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const getButtonState = () => {
    if (!member) return { type: 'self' }
    if (member._id === user.id) return { type: 'self' }

    const incoming = requests.find(
      r => r.from._id === member._id && r.status === 'pending'
    )
    if (incoming) return { type: 'incoming', requestId: incoming._id }

    const matchedIncoming = requests.find(
      r => (r.from._id === member._id || r.to === member._id) && r.status === 'accepted'
    )
    if (matchedIncoming) return { type: 'matched', requestId: matchedIncoming._id }
    
    const matchedSent = sentRequests.find(
      r => (r.from === member._id || r.to === member._id) && r.status === 'accepted'
    )
    if (matchedSent) return { type: 'matched', requestId: matchedSent._id }

    const sent = sentRequests.find(
      r => r.to === member._id && r.status === 'pending'
    )
    if (sent) return { type: 'sent' }

    const memberMatched = sentRequests.find(
      r => (r.from === member._id || r.to === member._id) && r.status === 'accepted'
    )
    if (memberMatched) return { type: 'taken' }

    return { type: 'available' }
  }

  const renderButton = () => {
    const state = getButtonState()
    
    // The "Message" button should always be available unless it's the user's own profile
    const messageButton = state.type !== 'self' ? (
      <button 
        className="btn-secondary" 
        onClick={() => navigate(`/chat/${id}`)}
        style={{ marginLeft: '12px' }}
      >
        Message
      </button>
    ) : null;

    let actionButton = null;
    switch (state.type) {
      case 'incoming':
        actionButton = (
          <button className="btn-primary" onClick={() => acceptRequest(state.requestId)}>
            Accept Request
          </button>
        )
        break;
      case 'matched':
        actionButton = (
          <button className="btn-danger" onClick={() => unmatchRequest(state.requestId)}>
            Unmatch
          </button>
        )
        break;
      case 'sent':
        actionButton = <button className="btn-disabled">Request Sent</button>
        break;
      case 'taken':
        actionButton = <button className="btn-disabled">Already Matched</button>
        break;
      case 'available':
        actionButton = <button className="btn-primary" onClick={sendRequest}>Send Request</button>
        break;
      default:
        actionButton = null;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {actionButton}
        {messageButton}
      </div>
    )
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

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Back button */}
        <button
          onClick={() => navigate('/browse')}
          style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          &larr; Back to Browse
        </button>

        {/* Top section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'flex-start',
          gap: '40px',
          marginBottom: '48px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--bg-secondary)'
              }}>
                {member.profile?.profilePic ? (
                  <img
                    src={member.profile.profilePic}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: 'var(--text-muted)'
                  }}>
                    {member?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                {member.name}
              </h1>
              {member.profile?.year && (
                <span className="tag">Year {member.profile.year}</span>
              )}
            </div>
            {member.profile?.course && (
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                {member.profile.course}
              </p>
            )}
          </div>
          <div style={{ paddingTop: '8px' }}>
            {renderButton()}
          </div>
        </div>

        <hr className="divider" />

        {/* Bio */}
        {member.profile?.bio && (
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '12px'
            }}>
              Bio
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.7, maxWidth: '600px' }}>
              {member.profile.bio}
            </p>
          </div>
        )}

        {/* Details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          marginBottom: '40px'
        }}>
          {member.profile?.sleepSchedule && (
            <div style={{ background: 'var(--bg)', padding: '20px 24px' }}>
              <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Sleep Schedule
              </p>
              <p style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                {member.profile.sleepSchedule}
              </p>
            </div>
          )}
          {member.profile?.studyHabits && (
            <div style={{ background: 'var(--bg)', padding: '20px 24px' }}>
              <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Study Habits
              </p>
              <p style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                {member.profile.studyHabits}
              </p>
            </div>
          )}
          {member.profile?.socialStyle && (
            <div style={{ background: 'var(--bg)', padding: '20px 24px' }}>
              <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Social Style
              </p>
              <p style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                {member.profile.socialStyle}
              </p>
            </div>
          )}
        </div>

        {/* Hobbies */}
        {member.profile?.hobbies?.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '12px'
            }}>
              Hobbies
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {member.profile.hobbies.map((hobby, i) => (
                <span key={i} className="tag">{hobby}</span>
              ))}
            </div>
          </div>
        )}

        {/* Instagram */}
        {member.profile?.instagram && (
          <div>
            <p style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '12px'
            }}>
              Instagram
            </p>
            <p style={{ fontSize: '14px' }}>{member.profile.instagram}</p>
          </div>
        )}
      </div>
    </>
  )
}