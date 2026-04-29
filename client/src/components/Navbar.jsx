import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import API from '../api/axios';
import './Navbar.css';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await API.get('/api/matches/requests');
        setRequestCount(res.data.length);
      } catch {
        // silently fail
      }
    };
    fetchRequests();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const navLinks = (
    <>
      <Link to="/browse" className={isActive('/browse')} onClick={() => setMobileOpen(false)}>
        Browse
      </Link>
      <Link to="/requests" className={isActive('/requests')} onClick={() => setMobileOpen(false)}>
        Requests
        {requestCount > 0 && <span className="navbar-link-badge">{requestCount}</span>}
      </Link>
      <Link to="/me" className={isActive('/me')} onClick={() => setMobileOpen(false)}>
        My Profile
      </Link>
      <button className="navbar-logout" onClick={handleLogout}>
        Logout
      </button>
    </>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/browse" className="navbar-brand">
            <span className="navbar-brand-icon">🏠</span>
            HostelMatch
          </Link>

          <div className="navbar-links">
            {navLinks}
          </div>

          <button
            className="navbar-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks}
        </div>
      )}
    </>
  );
}
