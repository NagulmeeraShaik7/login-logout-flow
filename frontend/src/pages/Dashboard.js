import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="welcome-message">
          Welcome, <span className="user-email">{user?.email}</span> 🎉
        </p>
      </div>
    </div>
  );
}
