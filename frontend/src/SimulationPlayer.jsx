import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SimulationPlayer.css';

import clickSound from './assets/click.mp3';
import transitionSound from './assets/transition.mp3';

const SimulationPlayer = ({ onBack }) => {
  const [storyText, setStoryText] = useState("");
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [turnCount, setTurnCount] = useState(0); // <-- NEW: Track turns

  const clickAudio = new Audio(clickSound);
  const transitionAudio = new Audio(transitionSound);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize voice here if you want
    window.speechSynthesis.speak(utterance);
  };

  const advanceStory = async (choice = null, turns = 0) => {
    setIsLoading(true);
    setChoices([]);
    try {
      transitionAudio.play();
      const response = await axios.post('http://localhost:8000/simulation', {
        story_id: 'nova-1',
        last_choice: choice,
        turn_count: turns, // <-- NEW: Send turn count to backend
      });
      
      const newStoryText = response.data.story_text;
      setStoryText(newStoryText);
      setChoices(response.data.choices || []);
      speak(newStoryText);
    } catch (error) {
      console.error("Error fetching simulation data:", error);
      const errorText = "An error occurred. Please try again.";
      setStoryText(errorText);
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    advanceStory(null, 0); // Start the story at turn 0
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleChoice = (choice) => {
    clickAudio.play();

    // Handle special end-game choices
    if (choice === 'Return to Hub') {
      onBack();
      return;
    }
    if (choice === 'Play Again') {
      setTurnCount(0);
      advanceStory(null, 0);
      return;
    }
    
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    advanceStory(choice, newTurnCount);
  };

  return (
    <div className="simulation-container">
      {/* ... The JSX for this component remains largely the same ... */}
       <button className="simulation-back-button" onClick={onBack}>← Back to Hub</button>
      <div className="simulation-content">
        <p className="simulation-story-text">
          {isLoading && !storyText ? "Starting simulation..." : storyText}
        </p>
        <div className="simulation-choices">
          {isLoading ? (
            <p className="simulation-loading">Simulating...</p>
          ) : (
            choices.map((choice, index) => (
              <button 
                key={index} 
                className="simulation-choice-button" 
                onClick={() => handleChoice(choice)}
              >
                {choice}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;
