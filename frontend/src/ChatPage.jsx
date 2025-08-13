import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatPage.css'; // We'll create this file next

const ChatPage = ({ onNavigate, profile, onClearChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recommendations]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    const newUserMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await axios.post('https://ai-buddy-backend-1.onrender.com/chat', {
        message: input,
        name: profile.name,
        history: messages,
      });
      const aiMessage = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (messages.length === 0) {
      alert("Chat a little first so I know your vibe!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://ai-buddy-backend-1.onrender.com/recommend', {
        history: messages.slice(-4),
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
    if (onClearChat) onClearChat(); // Call the prop function if it exists
  };

  return (
    <div className="chat-page-container">
      <button className="back-button" onClick={() => onNavigate('home')}>← Back to Hub</button>
      <div className="chat-panel">
        <h2>Future Self Chat</h2>
        <p className="description">Talk to the version of you who's already figured it out.</p>
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
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message your future self..."
          />
          <button onClick={handleGetRecommendation} title="Get a Suggestion">✨</button>
          <button onClick={handleSend}>➤</button>
          <button onClick={handleClearChat} title="Clear Chat">🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
