import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import './App.css';

// Import our new Simulation Player component


// NEW: Import our background music file
import backgroundMusic from './assets/background_music.mp3';

// Initialize Mermaid once
mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });

// A MORE ROBUST MERMAID CHART COMPONENT
const MermaidChart = ({ code }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && code) {
      ref.current.innerHTML = 'Generating graph...';
      mermaid.render('mermaid-graph-' + Date.now(), code)
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch((e) => {
          console.error("Mermaid render error:", e.str || e.message);
          if (ref.current) {
            ref.current.innerHTML = `<div style="color: #ff8a8a; padding: 1rem;">Oops! The AI gave me a diagram I can't draw. Try rephrasing your thought.</div>`;
          }
        });
    }
  }, [code]);

  return <div ref={ref}></div>;
};


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profile, setProfile] = useState({ name: '' }); 

  const [thoughts, setThoughts] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isUnknotting, setIsUnknotting] = useState(false);
  
  const [recommendations, setRecommendations] = useState([]);

  const [isSimulationActive, setIsSimulationActive] = useState(false);

  // NEW: State for background music
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Controlled by user
  const audioRef = useRef(null); // Reference to the audio element

  const messagesEndRef = useRef(null);
  const unknotterResultRef = useRef(null);

  // NEW: Effect to play/pause music
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing music:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    let savedName = localStorage.getItem('aiBuddyUsername');
    if (!savedName) {
      savedName = window.prompt("What should I call you, teammate?", "Friend");
      if (!savedName || savedName.trim() === '') {
        savedName = 'Friend';
      }
      localStorage.setItem('aiBuddyUsername', savedName);
    }
    setProfile({ name: savedName });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recommendations]); 

  useEffect(() => {
    if (mermaidCode && unknotterResultRef.current) {
      setTimeout(() => {
        unknotterResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [mermaidCode]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: input,
        name: profile.name,
        history: messages
      });
      const aiMessage = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnknot = async () => {
    if (thoughts.trim() === '') return;
    setIsUnknotting(true);
    setMermaidCode('');
    try {
      const response = await axios.post('http://localhost:8000/unknot', { thoughts });
      setMermaidCode(response.data.mermaid || '');
    } catch (error) {
      console.error("Error unknotting:", error);
      setMermaidCode('graph TD; Error[Error];');
    } finally {
      setIsUnknotting(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (messages.length === 0) {
      alert("Chat a little first so I know your vibe!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/recommend', {
        history: messages.slice(-4)
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      alert("Couldn't get recommendations right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchUrl = (item) => {
    const query = encodeURIComponent(item.query);
    if (item.type === 'youtube') {
      return `https://www.youtube.com/results?search_query=${query}`;
    }
    return `https://www.google.com/search?q=${query}`;
  };

  const handleClearChat = () => {
    setMessages([]);
    setRecommendations([]);
    setInput('');
    setIsLoading(false);
  };

  // NEW: Toggle music playback
  const toggleMusic = () => {
    setIsMusicPlaying(prev => !prev);
  };


  return (
    <div className="main-container">
      <header className="header">
        <h1>AI Buddy</h1>
        <div className="user-profile">
          <span>{profile.name}</span>
          <div className="user-avatar">{profile.name ? profile.name.charAt(0).toUpperCase() : '?'}</div>
        </div>
      </header>

      {/* NEW: Audio element for background music */}
      <audio ref={audioRef} src={backgroundMusic} loop volume={0.2} />

      {/* NEW: Animated Music Button */}
      <button 
        className={`music-toggle-button ${isMusicPlaying ? 'playing' : ''}`}
        onClick={toggleMusic}
        title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isMusicPlaying ? '🎵' : '🎧'}
        {isMusicPlaying && (
          <div className="sound-waves">
            <span className="wave"></span>
            <span className="wave"></span>
            <span className="wave"></span>
          </div>
        )}
      </button>

      {isSimulationActive ? (
        <SimulationPlayer onBack={() => setIsSimulationActive(false)} />
      ) : (
        <main className="content-grid">
          {/* Left Panel: Future Self Chat */}
          <div className="panel">
            <h2>Future Self Chat</h2>
            <p className="description">Talk to the version of you who's already figured it out</p>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>{msg.content}</div>
              ))}
              {isLoading && <div className="message assistant">...</div>}
              <div ref={messagesEndRef} />
            </div>
            
            {recommendations.length > 0 && (
              <div className="recommendation-area">
                <h4>Feeling stuck? Maybe these will help:</h4>
                {recommendations.map((item, index) => (
                  <a key={index} href={getSearchUrl(item)} target="_blank" rel="noopener noreferrer" className="recommendation-link">
                    <strong>{item.type}:</strong> {item.title}
                  </a>
                ))}
                <button onClick={() => setRecommendations([])} className="close-recommendations">✖</button>
              </div>
            )}

            <div className="chat-input-area">
              <input
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message your future self..."
              />
              <button onClick={handleGetRecommendation} title="Get a Suggestion">✨</button>
              <button onClick={handleSend}>➤</button>
              <button onClick={handleClearChat} title="Clear Chat" style={{ marginLeft: '10px' }}>🗑️</button>
            </div>
          </div>

          {/* Right Panel: Thought Unknotter */}
          <div className="panel">
            <h2>Thought Unknotter</h2>
            <p className="description">Untangle what's weighing on your mind</p>
            <textarea className="unknot-textarea" value={thoughts} onChange={(e) => setThoughts(e.target.value)} placeholder="Type what's bothering you..." />
            <button className="unknot-button" onClick={handleUnknot} disabled={isUnknotting}>
              {isUnknotting ? 'Unknotting...' : 'Unknot Thoughts'}
            </button>
            <div ref={unknotterResultRef}>
              {mermaidCode && (
                <div style={{ marginTop: '1rem', background: '#1f1c2b', borderRadius: '12px', padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <MermaidChart code={mermaidCode} />
                </div>
              )}
            </div>
            <button 
              className="unknot-button"
              onClick={() => setIsSimulationActive(true)}
              style={{marginTop: '1rem', background: '#4CAF50'}}
            >
              Start Mental Simulation
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
