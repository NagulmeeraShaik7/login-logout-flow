import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email} 🎉</p>
    </div>
  );
}
