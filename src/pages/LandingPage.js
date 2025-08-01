import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="content">
        <h1>Welcome to BrainBell</h1>
        <p>Empowering Learning with Smart Tests</p>
        <div className="buttons">
          <button onClick={() => navigate('/login')}>Get Started</button>
          {/* <button onClick={() => navigate('/login')}>Student Login</button> */}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
