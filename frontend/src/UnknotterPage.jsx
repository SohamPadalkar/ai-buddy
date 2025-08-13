import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import './UnknotterPage.css'; // Make sure you have this CSS file

// The UnknotterPage component
const UnknotterPage = ({ onBack }) => {
    const [thoughts, setThoughts] = useState('');
    const [mermaidCode, setMermaidCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                primaryColor: '#1a1a2e',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#ffffff',
                lineColor: '#ffffff',
                arrowheadColor: '#ffffff',
                secondaryColor: '#1a1a2e',
                tertiaryColor: '#1a1a2e',
                background: 'transparent',
                textColor: '#ffffff',
            }
        });
    }, []);

    useEffect(() => {
        if (mermaidCode) {
            const container = document.querySelector('.mermaid-container');
            if (container) {
                container.removeAttribute('data-processed');
                container.innerHTML = mermaidCode;
                try {
                    mermaid.run({
                        nodes: [container],
                    });
                } catch (e) {
                    console.error("Mermaid run error:", e);
                    setError("Oops! The AI gave me a diagram I can't draw. Try rephrasing your thought.");
                }
            }
        }
    }, [mermaidCode]);

    const handleUnknot = async () => {
        if (!thoughts) return;
        setIsLoading(true);
        setError('');
        setMermaidCode('');

        try {
            const response = await axios.post('https://ai-buddy-backend.onrender.com/unknot', { thoughts });

            if (response.data.mermaid) {
                setMermaidCode(response.data.mermaid);
            } else {
                setError("The AI returned an empty response. Please try again.");
            }

        } catch (err) {
            console.error("Error fetching mermaid diagram:", err);
            setError("Could not connect to the server. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container unknotter-page">
            <button className="back-button" onClick={onBack}>← Back to Hub</button>
            <div className="unknotter-content">
                {/* === START NEW INPUT PANEL === */}
                <div className="unknotter-input-panel">
                    <h1>The Thought Unknotter</h1>
                    <p className="description">Paste your tangled thoughts below. Our AI will map them out and help you find a path forward.</p> {/* Added class for styling */}

                    <textarea
                        className="thought-input"
                        value={thoughts}
                        onChange={(e) => setThoughts(e.target.value)}
                        placeholder="I'm stressed about my project, I don't know where to start, and I feel overwhelmed..."
                    />
                    <button className="knot-button" onClick={handleUnknot} disabled={isLoading}>
                        {isLoading ? 'Unknotting...' : 'Unknot My Thoughts'}
                    </button>
                </div>
                {/* === END NEW INPUT PANEL === */}

                {/* === START NEW OUTPUT PANEL === */}
                <div className="unknotter-output-panel">
                    {error && <p className="error-message">{error}</p>}
                    <div className="mermaid-container">
                        {isLoading && <p className="placeholder-text">Unknotting your thoughts...</p>} {/* Moved loading message here */}
                        {!mermaidCode && !isLoading && !error && (
                            <p className="placeholder-text">Your flowchart will appear here.</p>
                        )}
                    </div>
                </div>
                {/* === END NEW OUTPUT PANEL === */}
            </div>
        </div>
    );
};

export default UnknotterPage;
