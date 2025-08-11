import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import './App.css';

// Initialize Mermaid once
mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });

// --- A MORE ROBUST MERMAID CHART COMPONENT ---
const MermaidChart = ({ code }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && code) {
      ref.current.innerHTML = 'Generating graph...'; // Provide feedback
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
  
  const messagesEndRef = useRef(null);
  const unknotterResultRef = useRef(null);

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
  }, [messages]);

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
      setMermaidCode('graph TD; Error[Error];'); // Set a valid error graph
    } finally {
      setIsUnknotting(false);
    }
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
      <main className="content-grid">
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
          <div className="chat-input-area">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Message your future self..." />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
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
        </div>
      </main>
    </div>
  );
}

export default App;
