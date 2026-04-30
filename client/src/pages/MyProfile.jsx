import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ImageUpload from '../components/ImageUpload'

export default function MyProfile() {
  const { token } = useAuth()
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    age: '',
    course: '',
    year: '',
    bio: '',
    sleepSchedule: '',
    studyHabits: '',
    socialStyle: '',
    hobbies: '',
    instagram: '',
    profilePic: ''
  })

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token])

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { headers })
        setUser(res.data)
        const p = res.data.profile || {}
        setForm({
          age: p.age || '',
          course: p.course || '',
          year: p.year || '',
          bio: p.bio || '',
          sleepSchedule: p.sleepSchedule || '',
          studyHabits: p.studyHabits || '',
          socialStyle: p.socialStyle || '',
          hobbies: p.hobbies?.join(', ') || '',
          instagram: p.instagram || '',
          profilePic: p.profilePic || ''
        })
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [headers])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          profile: {
            ...form,
            age: form.age ? Number(form.age) : undefined,
            year: form.year ? Number(form.year) : undefined,
            hobbies: form.hobbies
              ? form.hobbies.split(',').map(h => h.trim()).filter(Boolean)
              : [],
            profilePic: form.profilePic || undefined
          }
        },
        { headers }
      )
      setUser(res.data)
      setEditing(false)
      setSuccess('Profile updated')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="page" style={{ color: 'var(--text-muted)' }}>Loading...</div>
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
          alignItems: 'flex-start',
          marginBottom: '48px'
        }}>
          <div>
            <span className="tag tag-accent" style={{ marginBottom: '12px', display: 'inline-block' }}>
              {user?.hostel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--bg-secondary)'
              }}>
                {user?.profile?.profilePic ? (
                  <img
                    src={user.profile.profilePic}
                    alt={user.name}
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
                    {user?.name?.charAt(0).toUpperCase()}
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
                {user?.name}
              </h1>
            </div>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              marginTop: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {user?.rollNumber}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            {!editing ? (
              <button className="btn-ghost" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <button className="btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <hr className="divider" />

        {error && <p className="error-msg" style={{ marginBottom: '16px' }}>{error}</p>}
        {success && (
          <p style={{ color: 'var(--success)', fontSize: '12px', marginBottom: '16px' }}>
            {success}
          </p>
        )}

        {!editing ? (
          /* View mode */
          <div>
            {user?.profile?.bio && (
              <div style={{ marginBottom: '40px' }}>
                <p style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px'
                }}>Bio</p>
                <p style={{ fontSize: '15px', lineHeight: 1.7, maxWidth: '600px' }}>
                  {user.profile.bio}
                </p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--border)',
              border: '1px solid var(--border)',
              marginBottom: '40px'
            }}>
              {[
                { label: 'Course', value: user?.profile?.course },
                { label: 'Year', value: user?.profile?.year ? `Year ${user.profile.year}` : null },
                { label: 'Age', value: user?.profile?.age },
                { label: 'Sleep Schedule', value: user?.profile?.sleepSchedule },
                { label: 'Study Habits', value: user?.profile?.studyHabits },
                { label: 'Social Style', value: user?.profile?.socialStyle },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ background: 'var(--bg)', padding: '20px 24px' }}>
                  <p style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px'
                  }}>{label}</p>
                  <p style={{ fontSize: '14px', textTransform: 'capitalize' }}>{value}</p>
                </div>
              ) : null)}
            </div>

            {user?.profile?.hobbies?.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <p style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px'
                }}>Hobbies</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {user.profile.hobbies.map((hobby, i) => (
                    <span key={i} className="tag">{hobby}</span>
                  ))}
                </div>
              </div>
            )}

            {user?.profile?.instagram && (
              <div>
                <p style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px'
                }}>Instagram</p>
                <p style={{ fontSize: '14px' }}>{user.profile.instagram}</p>
              </div>
            )}

            {!user?.profile?.bio && !user?.profile?.course && (
              <div style={{
                border: '1px dashed var(--border)',
                padding: '40px',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Your profile is empty. Fill it in so others can find you.
                </p>
                <button className="btn-primary" onClick={() => setEditing(true)}>
                  Fill in Profile
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Edit mode */
          <form onSubmit={handleSave} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Profile Photo</label>
              <ImageUpload
                currentPic={form.profilePic}
                onUpload={(url) => setForm({ ...form, profilePic: url })}
              />
            </div>

            <div className="form-group">
              <label>Course</label>
              <input name="course" value={form.course} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>

            <div className="form-group">
              <label>Year</label>
              <input name="year" type="number" min="1" max="6" value={form.year} onChange={handleChange} placeholder="e.g. 2" />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="e.g. 20" />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@handle" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell your future roommate about yourself..."
                rows={4}
                style={{
                  resize: 'vertical',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            <div className="form-group">
              <label>Sleep Schedule</label>
              <select name="sleepSchedule" value={form.sleepSchedule} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="early bird">Early Bird</option>
                <option value="night owl">Night Owl</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="form-group">
              <label>Study Habits</label>
              <select name="studyHabits" value={form.studyHabits} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="quiet studier">Quiet Studier</option>
                <option value="group studier">Group Studier</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="form-group">
              <label>Social Style</label>
              <select name="socialStyle" value={form.socialStyle} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="introverted">Introverted</option>
                <option value="extroverted">Extroverted</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hobbies (comma separated)</label>
              <input
                name="hobbies"
                value={form.hobbies}
                onChange={handleChange}
                placeholder="coding, gaming, reading"
              />
            </div>

            {error && <p className="error-msg" style={{ gridColumn: '1 / -1' }}>{error}</p>}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}