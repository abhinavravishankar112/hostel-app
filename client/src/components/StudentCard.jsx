import { Link } from 'react-router-dom';
import './StudentCard.css';

export default function StudentCard({ student, buttonState, onAction, actionLabel }) {
  const profile = student.profile || {};
  const initials = student.name
    ? student.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const renderButton = () => {
    switch (buttonState) {
      case 'send':
        return (
          <button className="btn btn-primary" onClick={() => onAction(student._id)}>
            Send Request
          </button>
        );
      case 'sent':
        return (
          <button className="btn btn-disabled" disabled>
            Request Sent
          </button>
        );
      case 'accept':
        return (
          <button className="btn btn-success" onClick={() => onAction(student._id)}>
            {actionLabel || 'Accept Request'}
          </button>
        );
      case 'matched':
        return (
          <button className="btn btn-disabled" disabled>
            Already Matched
          </button>
        );
      case 'self':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="student-card glass-card">
      <div className="student-card-header">
        <div className="student-card-avatar">{initials}</div>
        <div className="student-card-info">
          <Link to={`/profile/${student._id}`} className="student-card-name">
            {student.name}
          </Link>
          <div className="student-card-meta">
            {profile.course && <span>{profile.course}</span>}
            {profile.course && profile.year && <span className="student-card-meta-dot"></span>}
            {profile.year && <span>Year {profile.year}</span>}
          </div>
        </div>
      </div>

      {(profile.sleepSchedule || profile.socialStyle || profile.studyHabits) && (
        <div className="student-card-badges">
          {profile.sleepSchedule && <span className="badge">{profile.sleepSchedule}</span>}
          {profile.socialStyle && <span className="badge">{profile.socialStyle}</span>}
          {profile.studyHabits && <span className="badge badge-accent">{profile.studyHabits}</span>}
        </div>
      )}

      {profile.hobbies && profile.hobbies.length > 0 && (
        <div className="student-card-hobbies">
          {profile.hobbies.slice(0, 5).map((hobby, i) => (
            <span key={i} className="hobby-tag">{hobby}</span>
          ))}
          {profile.hobbies.length > 5 && (
            <span className="hobby-tag">+{profile.hobbies.length - 5}</span>
          )}
        </div>
      )}

      {buttonState && buttonState !== 'self' && (
        <div className="student-card-actions">
          {renderButton()}
        </div>
      )}
    </div>
  );
}
