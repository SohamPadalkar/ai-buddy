import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aiBuddyProfile');
    return saved ? JSON.parse(saved) : { name: 'Friend' };
  });

  useEffect(() => {
    localStorage.setItem('aiBuddyProfile', JSON.stringify(profile));
  }, [profile]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newUserMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: input,
        name: profile.name,
        history: messages
      });

      // NEW: Instead of adding full reply, add an empty one and type it out
      const aiMessage = { role: 'assistant', content: '', fullContent: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = { role: 'assistant', content: "Oops! Something went wrong. Please try again." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Typewriter effect for the last AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.fullContent && lastMessage.content !== lastMessage.fullContent) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const msg = updated[updated.length - 1];
          msg.content = lastMessage.fullContent.slice(0, msg.content.length + 1);
          return updated;
        });
      }, 50); // Speed: 50ms per character—tweak if too fast/slow
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Buddy</h1>
        <p>Your friendly AI Teammate</p>
      </div>

      {/* Profile input (keeping it simple as you wanted) */}
      <div className="profile-section" style={{ padding: '10px', borderBottom: '1px solid #444' }}>
        <label style={{ marginRight: '10px' }}>Your Name:</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Enter your name"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#333', color: 'white' }}
        />
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <p>{msg.content}</p> {/* Types out here */}
          </div>
        ))}
        {isLoading && <div className="message assistant"><p>...</p></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Talk to your buddy..."
        />
        <button onClick={handleSend} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
