import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/browse" replace />;
  }

  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-icon">🏠</div>
        <h1 className="landing-title">Find Your Perfect Roommate</h1>
        <p className="landing-subtitle">
          Browse profiles of students in your hostel, discover compatible roommates,
          and connect before move-in day. Making hostel life better, one match at a time.
        </p>
        <div className="landing-actions">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-ghost">Create Account</Link>
        </div>

        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">👤</div>
            <div className="landing-feature-title">Detailed Profiles</div>
            <div className="landing-feature-desc">
              Sleep schedule, study habits, hobbies — know your future roommate before you meet.
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">🔍</div>
            <div className="landing-feature-title">Browse Your Hostel</div>
            <div className="landing-feature-desc">
              See everyone assigned to your hostel and find someone who matches your lifestyle.
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">💬</div>
            <div className="landing-feature-title">Send Requests</div>
            <div className="landing-feature-desc">
              Found someone compatible? Send them a roommate request and get matched instantly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
