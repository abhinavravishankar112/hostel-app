import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import './MyProfile.css';

export default function MyProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: '', course: '', year: '', bio: '',
    sleepSchedule: '', studyHabits: '', socialStyle: '',
    hobbies: '', instagram: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/users/me');
      setProfile(res.data);
      const p = res.data.profile || {};
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
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        profile: {
          age: form.age ? Number(form.age) : undefined,
          course: form.course || undefined,
          year: form.year ? Number(form.year) : undefined,
          bio: form.bio || undefined,
          sleepSchedule: form.sleepSchedule || undefined,
          studyHabits: form.studyHabits || undefined,
          socialStyle: form.socialStyle || undefined,
          hobbies: form.hobbies ? form.hobbies.split(',').map(h => h.trim()).filter(Boolean) : [],
          instagram: form.instagram || undefined,
        },
      };
      await API.put('/api/users/me', payload);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container"><div className="browse-loading"><div className="spinner"></div></div></div>
      </>
    );
  }

  const p = profile?.profile || {};
  const initials = profile?.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const hasProfile = p.course || p.bio || p.sleepSchedule;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="myprofile-page">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your profile information</p>

          <div className="myprofile-card glass-card">
            <div className="myprofile-header">
              <div className="myprofile-header-left">
                <div className="myprofile-avatar">{initials}</div>
                <div>
                  <div className="myprofile-name">{profile?.name}</div>
                  <div className="myprofile-email">{profile?.email}</div>
                  <div className="myprofile-hostel">{profile?.hostel}</div>
                </div>
              </div>
              {!editing && (
                <button className="btn btn-ghost myprofile-edit-btn" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="myprofile-edit-form">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" name="age" value={form.age} onChange={handleChange} placeholder="20" />
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-input" type="text" name="course" value={form.course} onChange={handleChange} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" name="year" value={form.year} onChange={handleChange} placeholder="2" min="1" max="5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell others about yourself..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Sleep Schedule</label>
                  <select className="form-select" name="sleepSchedule" value={form.sleepSchedule} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="early bird">Early Bird</option>
                    <option value="night owl">Night Owl</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Study Habits</label>
                  <select className="form-select" name="studyHabits" value={form.studyHabits} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="quiet studier">Quiet Studier</option>
                    <option value="group studier">Group Studier</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Social Style</label>
                  <select className="form-select" name="socialStyle" value={form.socialStyle} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="introverted">Introverted</option>
                    <option value="extroverted">Extroverted</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hobbies</label>
                  <input className="form-input" type="text" name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="coding, gaming, reading" />
                  <span className="form-error" style={{ color: 'var(--text-muted)' }}>Separate with commas</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input className="form-input" type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@handle" />
                </div>
                <div className="myprofile-edit-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {!hasProfile && (
                  <div className="myprofile-empty-notice">
                    Your profile is empty. Click <strong>Edit</strong> to add your details so others can find you.
                  </div>
                )}

                {hasProfile && (
                  <>
                    {p.bio && (
                      <div className="myprofile-section">
                        <div className="myprofile-section-title">About</div>
                        <div className="myprofile-bio">{p.bio}</div>
                      </div>
                    )}

                    <div className="myprofile-details">
                      {p.course && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Course</div><div className="myprofile-detail-value">{p.course}</div></div>}
                      {p.year && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Year</div><div className="myprofile-detail-value">{p.year}</div></div>}
                      {p.age && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Age</div><div className="myprofile-detail-value">{p.age}</div></div>}
                      {p.sleepSchedule && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Sleep Schedule</div><div className="myprofile-detail-value">{p.sleepSchedule}</div></div>}
                      {p.studyHabits && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Study Habits</div><div className="myprofile-detail-value">{p.studyHabits}</div></div>}
                      {p.socialStyle && <div className="myprofile-detail-item"><div className="myprofile-detail-label">Social Style</div><div className="myprofile-detail-value">{p.socialStyle}</div></div>}
                    </div>

                    {p.hobbies && p.hobbies.length > 0 && (
                      <div className="myprofile-section">
                        <div className="myprofile-section-title">Hobbies</div>
                        <div className="myprofile-hobbies">
                          {p.hobbies.map((h, i) => <span key={i} className="hobby-tag">{h}</span>)}
                        </div>
                      </div>
                    )}

                    {p.instagram && (
                      <div className="myprofile-section">
                        <div className="myprofile-section-title">Social</div>
                        <span className="myprofile-instagram">📷 {p.instagram}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="myprofile-logout-section">
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
