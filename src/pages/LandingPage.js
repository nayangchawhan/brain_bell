import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="hero">
        <h1>Welcome to <span className="highlight">BrainBell</span></h1>
        <p>Empowering education with intelligent surveys and real-time insights.</p>
        <button className="primary-btn" onClick={() => navigate('/login')}>Get Started</button>
      </header>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-pen-alt"></i>
            <h3>AI Survey Creator</h3>
            <p>Create detailed, smart surveys in seconds using AI. Just describe your needs and watch it build instantly.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-user-check"></i>
            <h3>Student Friendly</h3>
            <p>Students can attend surveys seamlessly with a simple UI — no confusion, no clutter.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-bar"></i>
            <h3>Instant Analytics</h3>
            <p>Visual breakdowns of responses to help you make decisions fast with graphs and percentage bars.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-database"></i>
            <h3>Realtime Data</h3>
            <p>All responses and surveys are stored securely and updated live using Firebase Realtime Database.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-lock"></i>
            <h3>Secure & Private</h3>
            <p>Data is stored safely. Only creators can view and manage results and responses.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-mobile-alt"></i>
            <h3>Mobile Ready</h3>
            <p>Use BrainBell on mobile or desktop — responsive design makes sure it fits all screens perfectly.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users-cog"></i>
            <h3>Multi-Role Access</h3>
            <p>Designed for teachers and students — secure access control ensures each role sees what they need.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-desktop"></i>
            <h3>Clean UI</h3>
            <p>Minimal, modern interface that's distraction-free and built to focus on data clarity and ease of use.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 BrainBell. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
