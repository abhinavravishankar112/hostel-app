import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StudentCard from '../components/StudentCard';
import './Browse.css';

export default function Browse() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [hostelRes, incomingRes, sentRes] = await Promise.all([
        API.get('/api/users/hostel'),
        API.get('/api/matches/requests'),
        API.get('/api/matches/sent'),
      ]);
      setStudents(hostelRes.data);
      setIncoming(incomingRes.data);
      setSent(sentRes.data);
    } catch (err) {
      console.error('Failed to fetch browse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getButtonState = (student) => {
    if (student._id === user?.id) return 'self';

    // Check if anyone (including this student) has an accepted match
    // We check sent and incoming for accepted status
    const hasAcceptedMatch = [...sent, ...incoming].some(
      (r) =>
        r.status === 'accepted' &&
        (
          (r.from?._id || r.from) === student._id ||
          (r.to?._id || r.to) === student._id
        )
    );
    if (hasAcceptedMatch) return 'matched';

    // Check if the current user sent a request to this student
    const sentToStudent = sent.find(
      (r) => (r.to?._id || r.to) === student._id && r.status === 'pending'
    );
    if (sentToStudent) return 'sent';

    // Check if this student sent a request to the current user
    const incomingFromStudent = incoming.find(
      (r) => (r.from?._id || r.from) === student._id && r.status === 'pending'
    );
    if (incomingFromStudent) return 'accept';

    return 'send';
  };

  const handleAction = async (studentId) => {
    setActionLoading(studentId);
    try {
      // Determine action based on current button state
      const studentState = getButtonState({ _id: studentId });

      if (studentState === 'send') {
        await API.post(`/api/matches/request/${studentId}`);
      } else if (studentState === 'accept') {
        const request = incoming.find(
          (r) => (r.from?._id || r.from) === studentId && r.status === 'pending'
        );
        if (request) {
          await API.put(`/api/matches/accept/${request._id}`);
        }
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const profile = s.profile || {};
    return (
      s.name?.toLowerCase().includes(q) ||
      profile.course?.toLowerCase().includes(q) ||
      profile.hobbies?.some((h) => h.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="browse-header">
          <div className="browse-header-left">
            <h1 className="page-title">Browse Hostel</h1>
            <p className="page-subtitle">Find students in your hostel and send roommate requests</p>
          </div>
          <div className="browse-search">
            <span className="browse-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, course, hobby..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="browse-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="browse-count">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} in your hostel
            </div>
            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏘️</div>
                <div className="empty-state-text">No students found</div>
                <div className="empty-state-sub">Try adjusting your search</div>
              </div>
            ) : (
              <div className="browse-grid">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    buttonState={getButtonState(student)}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
