import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
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

      // Add empty AI message for typewriter effect
      const aiMessage = {
        role: 'assistant',
        content: '',
        fullContent: response.data.reply
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = {
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again."
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Typewriter effect for last AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.fullContent &&
      lastMessage.content !== lastMessage.fullContent
    ) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const msg = updated[updated.length - 1];
          msg.content = lastMessage.fullContent.slice(0, msg.content.length + 1);
          return updated;
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose'
    });
  }, []);

  const MermaidChart = ({ code }) => {
    const ref = useRef(null);

    useEffect(() => {
      if (ref.current && code) {
        let cleanCode = (code || '').trim();

        // Remove markdown code block fences if present
        if (cleanCode.startsWith("```")) {
          cleanCode = cleanCode.replace(/```(mermaid)?\s*([\s\S]*?)```/, '$2').trim();
        }

        // Ensure proper graph header if missing
        if (!/^graph\s+(TD|LR|BT|RL)\b/i.test(cleanCode)) {
          cleanCode = 'graph TD;\n' + cleanCode;
        }

        ref.current.innerHTML = '';
        mermaid
          .render('mermaid-graph-' + Date.now(), cleanCode)
          .then(({ svg }) => {
            if (ref.current) {
              ref.current.innerHTML = svg;
            }
          })
          .catch(err => {
            if (ref.current) {
              ref.current.innerHTML =
                '<div style="color:red;padding:10px;">Invalid Mermaid diagram—check console!</div>';
            }
            console.error('Mermaid render error:', err, '\nCode was:\n', cleanCode);
          });
      }
    }, [code]);

    return <div ref={ref} style={{ textAlign: 'center', minHeight: '50px' }} />;
  };

  // Tabs & Unknotter states
  const [activeTab, setActiveTab] = useState('chat');
  const [thoughts, setThoughts] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isUnknotting, setIsUnknotting] = useState(false);

  const handleUnknot = async () => {
    if (thoughts.trim() === '') return;
    setIsUnknotting(true);
    setMermaidCode('');

    try {
      const response = await axios.post('http://localhost:8000/unknot', { thoughts });
      setMermaidCode(response.data.mermaid || '');
    } catch (error) {
      console.error("Error unknotting:", error);
      setMermaidCode('graph TD; A[Error] --> B[Try again]');
    } finally {
      setIsUnknotting(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Buddy</h1>
        <p>Your friendly AI Teammate</p>
      </div>

      {/* Profile */}
      <div className="profile-section" style={{ padding: '10px', borderBottom: '1px solid #444' }}>
        <label style={{ marginRight: '10px' }}>Your Name:</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Enter your name"
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#333',
            color: 'white'
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'chat' ? '#007bff' : '#444',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '4px 0 0 4px'
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('unknotter')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'unknotter' ? '#007bff' : '#444',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '0 4px 4px 0'
          }}
        >
          Thought Unknotter
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <p>{msg.content}</p>
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
        </>
      ) : (
        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Dump your messy thoughts here..."
            style={{
              width: '100%',
              height: '100px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #555',
              background: '#333',
              color: 'white',
              marginBottom: '10px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleUnknot}
            disabled={isUnknotting}
            style={{
              padding: '10px',
              background: isUnknotting ? '#555' : '#007bff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: isUnknotting ? 'not-allowed' : 'pointer'
            }}
          >
            {isUnknotting ? 'Unknotting...' : 'Unknot My Thoughts'}
          </button>
          {mermaidCode && (
            <div
              style={{
                marginTop: '20px',
                background: '#222',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                border: '1px solid #444'
              }}
            >
              <MermaidChart code={mermaidCode} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
