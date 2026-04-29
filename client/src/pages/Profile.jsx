import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, incomingRes, sentRes] = await Promise.all([
          API.get(`/api/users/${id}`),
          API.get('/api/matches/requests'),
          API.get('/api/matches/sent'),
        ]);
        setProfile(userRes.data);
        setIncoming(incomingRes.data);
        setSent(sentRes.data);

        // Compute button state
        const studentId = userRes.data._id;
        if (studentId === user?.id) {
          setButtonState('self');
        } else {
          const hasAccepted = [...sentRes.data, ...incomingRes.data].some(
            (r) =>
              r.status === 'accepted' &&
              ((r.from?._id || r.from) === studentId || (r.to?._id || r.to) === studentId)
          );
          if (hasAccepted) {
            setButtonState('matched');
          } else if (
            sentRes.data.find((r) => (r.to?._id || r.to) === studentId && r.status === 'pending')
          ) {
            setButtonState('sent');
          } else if (
            incomingRes.data.find((r) => (r.from?._id || r.from) === studentId && r.status === 'pending')
          ) {
            setButtonState('accept');
          } else {
            setButtonState('send');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (buttonState === 'send') {
        await API.post(`/api/matches/request/${id}`);
        setButtonState('sent');
      } else if (buttonState === 'accept') {
        const request = incoming.find(
          (r) => (r.from?._id || r.from) === id && r.status === 'pending'
        );
        if (request) {
          await API.put(`/api/matches/accept/${request._id}`);
          setButtonState('matched');
        }
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const p = profile?.profile || {};
  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const renderButton = () => {
    switch (buttonState) {
      case 'send':
        return (
          <button className="btn btn-primary" onClick={handleAction} disabled={actionLoading}>
            {actionLoading ? 'Sending...' : 'Send Request'}
          </button>
        );
      case 'sent':
        return <button className="btn btn-disabled" disabled>Request Sent</button>;
      case 'accept':
        return (
          <button className="btn btn-success" onClick={handleAction} disabled={actionLoading}>
            {actionLoading ? 'Accepting...' : 'Accept Request'}
          </button>
        );
      case 'matched':
        return <button className="btn btn-disabled" disabled>Already Matched</button>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="profile-page">
          <button className="profile-back" onClick={() => navigate('/browse')}>
            ← Back to Browse
          </button>

          {loading ? (
            <div className="profile-loading">
              <div className="spinner"></div>
            </div>
          ) : !profile ? (
            <div className="empty-state">
              <div className="empty-state-icon">😕</div>
              <div className="empty-state-text">Profile not found</div>
            </div>
          ) : (
            <div className="profile-card glass-card">
              <div className="profile-top">
                <div className="profile-avatar">{initials}</div>
                <div>
                  <div className="profile-name">{profile.name}</div>
                  <div className="profile-meta">
                    {p.course && <span>{p.course}</span>}
                    {p.course && p.year && <span className="profile-meta-dot"></span>}
                    {p.year && <span>Year {p.year}</span>}
                  </div>
                </div>
              </div>

              {p.bio && (
                <div className="profile-section">
                  <div className="profile-section-title">About</div>
                  <div className="profile-bio">{p.bio}</div>
                </div>
              )}

              <div className="profile-section">
                <div className="profile-section-title">Lifestyle</div>
                <div className="profile-details">
                  {p.sleepSchedule && (
                    <div className="profile-detail-item">
                      <div className="profile-detail-label">Sleep Schedule</div>
                      <div className="profile-detail-value">{p.sleepSchedule}</div>
                    </div>
                  )}
                  {p.studyHabits && (
                    <div className="profile-detail-item">
                      <div className="profile-detail-label">Study Habits</div>
                      <div className="profile-detail-value">{p.studyHabits}</div>
                    </div>
                  )}
                  {p.socialStyle && (
                    <div className="profile-detail-item">
                      <div className="profile-detail-label">Social Style</div>
                      <div className="profile-detail-value">{p.socialStyle}</div>
                    </div>
                  )}
                  {p.age && (
                    <div className="profile-detail-item">
                      <div className="profile-detail-label">Age</div>
                      <div className="profile-detail-value">{p.age}</div>
                    </div>
                  )}
                </div>
              </div>

              {p.hobbies && p.hobbies.length > 0 && (
                <div className="profile-section">
                  <div className="profile-section-title">Hobbies</div>
                  <div className="profile-hobbies">
                    {p.hobbies.map((hobby, i) => (
                      <span key={i} className="hobby-tag">{hobby}</span>
                    ))}
                  </div>
                </div>
              )}

              {p.instagram && (
                <div className="profile-section">
                  <div className="profile-section-title">Social</div>
                  <a
                    href={`https://instagram.com/${p.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-instagram"
                  >
                    📷 {p.instagram}
                  </a>
                </div>
              )}

              {buttonState && buttonState !== 'self' && (
                <div className="profile-action">
                  {renderButton()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
