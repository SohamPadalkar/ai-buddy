import React from 'react';
import './Homepage.css';

const Homepage = ({ onNavigate }) => {
  return (
    // We now use a wrapper to control the layout, just like the simulation page
    <div className="home-wrapper">
      {/* Background video and scrim */}
      <video
        className="home-bg-video"
        src="/background.mp4" // Make sure this is in your /public folder
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="home-scrim" />

      {/* Main content area that will scroll if needed */}
      <div className="home-content">
        {/* Logo is now inside the main content flow for better spacing */}
        <img src="/logo.png" alt="AI Buddy Logo" className="brand-logo" />

        <div className="hero-section">
          <h1 className="hero-title">Welcome, Teammate</h1>
          <p className="hero-sub">Your personal AI-powered space for mental clarity and growth.</p>
        </div>

        <div className="cards-container">
          {/* Card 1 */}
          <div className="card" role="link" tabIndex={0} onClick={() => onNavigate('chat')}>
            <h2 className="card-title">Future Self Chat</h2>
            <p className="card-desc">Get personalized advice and recommendations from your future self.</p>
            <div className="card-icon">💬</div>
          </div>

          {/* Card 2 */}
          <div className="card" role="link" tabIndex={0} onClick={() => onNavigate('unknotter')}>
            <h2 className="card-title">Thought Unknotter</h2>
            <p className="card-desc">Visualize and untangle your messy, overwhelming thoughts.</p>
            <div className="card-icon">🧠</div>
          </div>

          {/* Card 3 */}
          <div className="card" role="link" tabIndex={0} onClick={() => onNavigate('simulations')}>
            <h2 className="card-title">Guided Simulations</h2>
            <p className="card-desc">Embark on interactive mental adventures to build resilience.</p>
            <div className="card-icon">🚀</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
