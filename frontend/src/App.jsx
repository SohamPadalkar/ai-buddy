import { useState, useEffect, useRef } from 'react';
import './App.css';

// Import all our page components
import Homepage from './Homepage';
import ChatPage from './ChatPage';
import UnknotterPage from './UnknotterPage';
import SimulationPlayer from './SimulationPlayer';

// Import BOTH music files
import backgroundMusic from './assets/background_music.mp3';
import simulationMusic from './assets/simulation_music.mp3';

// Initialize Mermaid once with better scaling
mermaid.initialize({
  startOnLoad: false,
  theme: 'base', // Use base theme to control styling via CSS
  securityLevel: 'loose',
  flowchart: {
    nodeSpacing: 100, // Increase space between nodes
    rankSpacing: 100 // Increase space between ranks/levels
  },
  // Global text and line color settings for clarity on white background
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  textColor: '#000000',
  lineColor: '#000000',
  // You can add more specific settings for other diagram types here if needed
  gantt: {
    barHeight: 60
  },
  sequence: {
    actorStyle: 'fill:#fff;stroke:#333;font-size:16px;'
  }
});


function App() {
  const [profile, setProfile] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState('home');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Get the correct music track based on the current page
  const musicSource = currentPage === 'simulations' ? simulationMusic : backgroundMusic;

  // This effect now handles PLAYING/PAUSING
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing music:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  // This effect handles SWITCHING the track
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicSource;
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Error switching music:", e));
      }
    }
  }, [musicSource]);

  useEffect(() => {
    let savedName = localStorage.getItem('aiBuddyUsername');
    if (!savedName) savedName = window.prompt("What should I call you?", "Friend") || "Friend";
    localStorage.setItem('aiBuddyUsername', savedName);
    setProfile({ name: savedName });
  }, []);

  const toggleMusic = () => setIsMusicPlaying(prev => !prev);

  const renderPage = () => {
    switch (currentPage) {
      case 'chat': return <ChatPage onNavigate={setCurrentPage} profile={profile} />;
      case 'unknotter': return <UnknotterPage onNavigate={setCurrentPage} />;
      case 'simulations': return <SimulationPlayer onBack={() => setCurrentPage('home')} />;
      case 'home':
      default: return <Homepage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1>AI Buddy</h1>
        <div className="user-profile">
          <span>{profile.name}</span>
          <div className="user-avatar">{profile.name.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* The audio element now starts with the default music source */}
      <audio ref={audioRef} src={musicSource} loop volume={0.2} />

      {/* The music button remains the same */}
      <button
        className={`music-toggle-button ${isMusicPlaying ? 'playing' : ''}`}
        onClick={toggleMusic}
        title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isMusicPlaying ? '🎵' : '🎧'}
        {isMusicPlaying && (
          <div className="sound-waves">
            <span className="wave"></span><span className="wave"></span><span className="wave"></span>
          </div>
        )}
      </button>

      <main className="page-content-container">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
