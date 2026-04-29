import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import './Requests.css';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/api/matches/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      await API.put(`/api/matches/accept/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error('Accept failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await API.put(`/api/matches/reject/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="requests-page">
          <h1 className="page-title">Incoming Requests</h1>
          <p className="page-subtitle">Students who want to be your roommate</p>

          {loading ? (
            <div className="browse-loading">
              <div className="spinner"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💌</div>
              <div className="empty-state-text">No pending requests</div>
              <div className="empty-state-sub">
                When someone sends you a roommate request, it will appear here.
              </div>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req) => {
                const sender = req.from || {};
                const p = sender.profile || {};
                return (
                  <div key={req._id} className="request-card glass-card">
                    <div className="request-card-header">
                      <div className="request-card-avatar">
                        {getInitials(sender.name)}
                      </div>
                      <div className="request-card-info">
                        <Link to={`/profile/${sender._id}`} className="request-card-name">
                          {sender.name}
                        </Link>
                        <div className="request-card-meta">
                          {p.course && <span>{p.course}</span>}
                          {p.course && p.year && <span> · </span>}
                          {p.year && <span>Year {p.year}</span>}
                        </div>
                      </div>
                    </div>

                    {(p.sleepSchedule || p.socialStyle || p.studyHabits) && (
                      <div className="request-card-badges">
                        {p.sleepSchedule && <span className="badge">{p.sleepSchedule}</span>}
                        {p.socialStyle && <span className="badge">{p.socialStyle}</span>}
                        {p.studyHabits && <span className="badge badge-accent">{p.studyHabits}</span>}
                      </div>
                    )}

                    <div className="request-card-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleAccept(req._id)}
                        disabled={actionLoading === req._id}
                      >
                        {actionLoading === req._id ? '...' : 'Accept'}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(req._id)}
                        disabled={actionLoading === req._id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
