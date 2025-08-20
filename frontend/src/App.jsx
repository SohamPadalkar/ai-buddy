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
import uiClickSound from './assets/ui_click.mp3';

function App() {
  const [profile, setProfile] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState('home');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Get the correct music track based on the current page
  const musicSource = currentPage === 'simulations' ? simulationMusic : backgroundMusic;

  // This effect now handles PLAYING/PAUSING

  useEffect(() => {
    // This function will run once when the app first loads.
    const wakeUpServer = async () => {
      try {
        // Send a GET request to your new /ping endpoint.
        await axios.get('http://127.0.0.1:8000/ping');
        console.log('Server is awake!');
      } catch (error) {
        console.error('Error pinging server:', error);
      }
    };

    wakeUpServer();
  }, []);
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

  // NEW: This effect automatically starts music for the simulation
  useEffect(() => {
    // When we navigate to the simulation page...
    if (currentPage === 'simulations') {
      // ...turn the music on.
      setIsMusicPlaying(true);
    }
  }, [currentPage]); // This effect runs whenever the currentPage changes


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
  // In App.jsx, inside the App() function...

  // ... after your other useEffects ...

  // NEW: This effect handles the global UI click sound
  useEffect(() => {
    // Create a new audio object for our UI click sound
    const uiClickAudio = new Audio(uiClickSound);
    uiClickAudio.volume = 0.5; // Adjust volume as needed

    const handleGlobalClick = (event) => {
      // First, check if the click happened inside the simulation. 
      // If it did, do nothing, because it has its own sounds.
      if (event.target.closest('.simulation-container')) {
        return;
      }

      // Now, check if the element that was clicked is a button or a feature card.
      const clickableElement = event.target.closest(
        'button, .feature-card'
      );

      if (clickableElement) {
        // If it was a clickable element, play our new sound!
        uiClickAudio.play().catch(e => console.error("Error playing UI click:", e));
      }
    };

    // Add the listener to the whole app
    document.addEventListener('click', handleGlobalClick);

    // Important: Clean up the listener when the app closes
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []); // The empty array [] means this runs only once when the app starts.

  // ... rest of your App.jsx component


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
