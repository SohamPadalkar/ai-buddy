import React, { useState } from 'react';
import axios from 'axios';
import './SimulationPlayer.css';

import clickSound from './assets/click.mp3';
import transitionSound from './assets/transition.mp3';
import bgVideo from '/background2.mp4'; // 

const SimulationPlayer = ({ onBack }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const clickAudio = new Audio(clickSound);
  const transitionAudio = new Audio(transitionSound);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const advanceStory = async (choice = null, turns = 0) => {
    setIsLoading(true);
    setChoices([]);
    try {
      transitionAudio.play();
      const response = await axios.post('https://ai-buddy-backend-1.onrender.com/simulation', {
        story_id: 'nova-1',
        last_choice: choice,
        turn_count: turns,
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

  const handleChoice = (choice) => {
    clickAudio.play();

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

  const startSimulation = () => {
    setHasStarted(true);
    advanceStory(null, 0);
  };

  return (
    <div className="simulation-wrapper">
      {/* === Background Video === */}
      <video autoPlay loop muted playsInline className="simulation-bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="simulation-bg-overlay"></div>
      <img src="/logo.png" alt="logo" className="corner-logo" />


      {/* === Foreground Content === */}
      {!hasStarted ? (
        <div className="simulation-start-screen">
          <div className="simulation-start-content">
            <h1>Guided Simulation</h1>
            <p>Embark on an interactive mental adventure to build resilience and explore new perspectives.</p>
            <button className="start-simulation-button" onClick={startSimulation}>
              Begin Journey
            </button>
            <button className="simulation-back-button" onClick={onBack}>
              ← Or, Back to Hub
            </button>
          </div>
        </div>
      ) : (
        <div className="simulation-container">
          <button className="simulation-back-button" onClick={onBack}>
            ← Back to Hub
          </button>
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
      )}
    </div>
  );
};

export default SimulationPlayer;
