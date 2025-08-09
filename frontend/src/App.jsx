import { useState } from 'react';
import axios from 'axios';
import './App.css'; // We'll create this file for styling

function App() {
  // State to hold all the chat messages
  const [messages, setMessages] = useState([]);
  // State for the user's current input
  const [input, setInput] = useState('');
  // State to show a "loading" indicator
  const [isLoading, setIsLoading] = useState(false);

  // This function runs when the user clicks "Send"
  const handleSend = async () => {
    if (input.trim() === '') return; // Don't send empty messages

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]); // Add user's message to the chat
    setInput(''); // Clear the input box
    setIsLoading(true); // Show the loading indicator

    try {
      // This is the API call to our backend
      const response = await axios.post('http://localhost:8000/chat', {
        message: input,
        name: "Vilas" // We can make this dynamic later
      });

      // Add the AI's reply to the chat
      const aiMessage = { sender: 'ai', text: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Show an error message in the chat
      const errorMessage = { sender: 'ai', text: "Oops! Something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Hide the loading indicator
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Buddy</h1>
        <p>Your friendly AI Teammate</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message ai"><p>...</p></div>}
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
