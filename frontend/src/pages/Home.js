import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h2 className="home-title">Welcome to User Registration Demo</h2>
        <p className="home-subtitle">Please register or login to continue.</p>
        <div className="home-actions">
          <a href="/register" className="btn btn-register">Register</a>
          <a href="/login" className="btn btn-login">Login</a>
        </div>
      </div>
    </div>
  );
}
