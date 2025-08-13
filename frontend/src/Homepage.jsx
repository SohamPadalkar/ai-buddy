import React from 'react';
import './Homepage.css'; // We'll create this CSS file next

// We'll pass a function to tell the main App which page to navigate to
const Homepage = ({ onNavigate }) => {
  return (
    <div className="homepage-container">
      <div className="homepage-title">
        <h1>Welcome, Teammate</h1>
        <p>Your personal AI-powered space for mental clarity and growth.</p>
      </div>
      <div className="feature-cards-container">
        {/* Card 1: The Coach */}
        <div className="feature-card" onClick={() => onNavigate('chat')}>
          <h2>Future Self Chat</h2>
          <p>Get personalized advice and recommendations from your future self.</p>
          <div className="card-icon">💬</div>
        </div>

        {/* Card 2: The Analyst */}
        <div className="feature-card" onClick={() => onNavigate('unknotter')}>
          <h2>Thought Unknotter</h2>
          <p>Visualize and untangle your messy, overwhelming thoughts.</p>
          <div className="card-icon">🧠</div>
        </div>

        {/* Card 3: The Explorer */}
        <div className="feature-card" onClick={() => onNavigate('simulations')}>
          <h2>Guided Simulations</h2>
          <p>Embark on interactive mental adventures to build resilience.</p>
          <div className="card-icon">🚀</div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
