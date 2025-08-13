import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import './UnknotterPage.css'; // We'll create this file next

// A re-usable Mermaid Chart component
const MermaidChart = ({ code }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && code) {
      ref.current.innerHTML = 'Generating graph...';
      mermaid.render('mermaid-graph-' + Date.now(), code)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        })
        .catch((e) => {
          if (ref.current) ref.current.innerHTML = `<div class="mermaid-error">Oops! The AI gave me a diagram I can't draw. Try rephrasing your thought.</div>`;
          console.error("Mermaid render error:", e);
        });
    }
  }, [code]);
  return <div className="mermaid-container" ref={ref}></div>;
};

const UnknotterPage = ({ onNavigate }) => {
  const [thoughts, setThoughts] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isUnknotting, setIsUnknotting] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (mermaidCode && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [mermaidCode]);

  const handleUnknot = async () => {
    if (thoughts.trim() === '') return;
    setIsUnknotting(true);
    setMermaidCode(''); // Clear previous graph
    try {
      const response = await axios.post('https://ai-buddy-backend-1.onrender.com/unknot', { thoughts });
      setMermaidCode(response.data.mermaid || '');
    } catch (error) {
      console.error("Error unknotting:", error);
      setMermaidCode('graph TD; Error[Error processing thoughts. Please try again.];');
    } finally {
      setIsUnknotting(false);
    }
  };

  return (
    <div className="unknotter-page-container">
      <button className="back-button" onClick={() => onNavigate('home')}>← Back to Hub</button>
      <div className="unknotter-content">
        <div className="unknotter-input-panel">
          <h2>Thought Unknotter</h2>
          <p className="description">Untangle what's weighing on your mind.</p>
          <textarea
            className="unknot-textarea"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Type or paste your messy, tangled thoughts here... I'll turn them into a clear flowchart."
          />
          <button className="unknot-button" onClick={handleUnknot} disabled={isUnknotting}>
            {isUnknotting ? 'Unknotting...' : 'Unknot Thoughts'}
          </button>
        </div>
        <div className="unknotter-output-panel" ref={resultRef}>
          {mermaidCode ? (
            <MermaidChart code={mermaidCode} />
          ) : (
            <div className="placeholder-text">Your structured thoughts will appear here...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnknotterPage;
