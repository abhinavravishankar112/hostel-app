import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Browse() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [requests, setRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    year: '',
    sleepSchedule: '',
    socialStyle: ''
  })

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, incomingRes, sentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/hostel`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/requests`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/matches/sent`, { headers }),
        ])
        setMembers(membersRes.data)
        setRequests(incomingRes.data)
        setSentRequests(sentRes.data)
      } catch (err) {
        setError('Failed to load members')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [headers])

  const sendRequest = async (userId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/matches/request/${userId}`,
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

  const getButtonState = (member) => {
    if (member._id === user.id) return { type: 'self' }

    const incoming = requests.find(
      r => r.from._id === member._id && r.status === 'pending'
    )
    if (incoming) return { type: 'incoming', requestId: incoming._id }

    const matched = requests.find(
      r => (r.from._id === member._id || r.to === member._id) && r.status === 'accepted'
    )
    if (matched) return { type: 'matched' }

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

  const renderButton = (member) => {
    const state = getButtonState(member)
    switch (state.type) {
      case 'self':
        return null
      case 'incoming':
        return (
          <button
            className="btn-primary"
            onClick={(e) => { e.stopPropagation(); acceptRequest(state.requestId) }}
          >
            Accept Request
          </button>
        )
      case 'matched':
        return <button className="btn-disabled">Matched</button>
      case 'sent':
        return <button className="btn-disabled">Request Sent</button>
      case 'taken':
        return <button className="btn-disabled">Already Matched</button>
      case 'available':
        return (
          <button
            className="btn-ghost"
            onClick={(e) => { e.stopPropagation(); sendRequest(member._id) }}
          >
            Send Request
          </button>
        )
      default:
        return null
    }
  }

  const filteredMembers = members.filter(member => {
    if (filters.sleepSchedule && member.profile?.sleepSchedule !== filters.sleepSchedule) return false
    if (filters.socialStyle && member.profile?.socialStyle !== filters.socialStyle) return false
    if (filters.year && String(member.profile?.year) !== filters.year) return false
    return true
  })

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
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '48px'
        }}>
          <div>
            <span className="tag tag-accent" style={{ marginBottom: '12px', display: 'inline-block' }}>
              HOR 21A
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              All Members
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            {filteredMembers.length} student{filteredMembers.length !== 1 ? 's' : ''}
            {filteredMembers.length !== members.length && (
              <span style={{ color: 'var(--text-muted)' }}> (filtered from {members.length})</span>
            )}
          </p>
        </div>

        <hr className="divider" />

        {/* Filter bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          marginBottom: '32px'
        }}>
          <select
            value={filters.sleepSchedule}
            onChange={e => setFilters({ ...filters, sleepSchedule: e.target.value })}
            style={{ border: 'none', borderRadius: 0 }}
          >
            <option value="">All Sleep Schedules</option>
            <option value="early bird">Early Bird</option>
            <option value="night owl">Night Owl</option>
            <option value="flexible">Flexible</option>
          </select>

          <select
            value={filters.socialStyle}
            onChange={e => setFilters({ ...filters, socialStyle: e.target.value })}
            style={{ border: 'none', borderRadius: 0 }}
          >
            <option value="">All Social Styles</option>
            <option value="introverted">Introverted</option>
            <option value="extroverted">Extroverted</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            value={filters.year}
            onChange={e => setFilters({ ...filters, year: e.target.value })}
            style={{ border: 'none', borderRadius: 0 }}
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <button
            className="btn-ghost"
            onClick={() => setFilters({ year: '', sleepSchedule: '', socialStyle: '' })}
            style={{ border: 'none', borderLeft: '1px solid var(--border)' }}
          >
            Clear Filters
          </button>
        </div>

        {/* Empty filter state */}
        {filteredMembers.length === 0 && (
          <div style={{
            background: 'var(--bg)',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              No students match your filters.
            </p>
          </div>
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)'
        }}>
          {filteredMembers.map(member => (
            <div
              key={member._id}
              onClick={() => navigate(`/profile/${member._id}`)}
              style={{
                background: 'var(--bg)',
                padding: '28px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
            >
              {/* Profile pic */}
              <div style={{
                width: '48px',
                height: '48px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                marginBottom: '16px',
                background: 'var(--bg-secondary)',
                flexShrink: 0
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
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '18px',
                    color: 'var(--text-muted)'
                  }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + year */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}>
                  {member.name}
                </h3>
                {member.profile?.year && (
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    Y{member.profile.year}
                  </span>
                )}
              </div>

              {/* Course */}
              {member.profile?.course && (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {member.profile.course}
                </p>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {member.profile?.sleepSchedule && (
                  <span className="tag">{member.profile.sleepSchedule}</span>
                )}
                {member.profile?.socialStyle && (
                  <span className="tag">{member.profile.socialStyle}</span>
                )}
                {member.profile?.studyHabits && (
                  <span className="tag">{member.profile.studyHabits}</span>
                )}
              </div>

              {/* Hobbies */}
              {member.profile?.hobbies?.length > 0 && (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '20px'
                }}>
                  {member.profile.hobbies.slice(0, 3).join(', ')}
                </p>
              )}

              {/* Button */}
              <div onClick={e => e.stopPropagation()}>
                {renderButton(member)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}