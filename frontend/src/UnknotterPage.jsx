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

    // This is the magic part! It runs only when the component first loads.
    useEffect(() => {
        // We define our custom dark theme for Mermaid right here.
        mermaid.initialize({
            startOnLoad: false, // We'll render it manually
            theme: 'base',
            themeVariables: {
                // --- Node & Text Colors ---
                primaryColor: '#1a1a2e',      // The background of the nodes
                primaryTextColor: '#ffffff',    // The text color inside the nodes
                primaryBorderColor: '#ffffff', // The border around the nodes
                
                // --- Lines & Arrows ---
                lineColor: '#ffffff',
                arrowheadColor: '#ffffff',

                // --- Other potential colors to keep the theme consistent ---
                secondaryColor: '#1a1a2e',
                tertiaryColor: '#1a1a2e',
                background: 'transparent', // Make the overall chart background transparent
                textColor: '#ffffff', // A general fallback for any other text
            }
        });
    }, []); // The empty array [] means this runs only ONCE.

    // This effect runs whenever the `mermaidCode` state changes.
    useEffect(() => {
        if (mermaidCode) {
            const container = document.querySelector('.mermaid-container');
            if (container) {
                container.removeAttribute('data-processed'); // Reset the processed flag
                container.innerHTML = mermaidCode; // Put the raw code in
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
        setMermaidCode(''); // Clear previous diagram
        
        try {
            // REMEMBER to replace this with your live Render backend URL!
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
    
    // The JSX that renders our page
    return (
        <div className="page-container unknotter-page">
            <button className="back-button" onClick={onBack}>← Back to Hub</button>
            <div className="unknotter-content">
                <h1>The Thought Unknotter</h1>
                <p>Paste your tangled thoughts below. Our AI will map them out and help you find a path forward.</p>
                
                <textarea
                    className="thought-input"
                    value={thoughts}
                    onChange={(e) => setThoughts(e.target.value)}
                    placeholder="I'm stressed about my project, I don't know where to start, and I feel overwhelmed..."
                />
                <button className="knot-button" onClick={handleUnknot} disabled={isLoading}>
                    {isLoading ? 'Unknotting...' : 'Unknot My Thoughts'}
                </button>

                <div className="diagram-output">
                    {error && <p className="error-message">{error}</p>}
                    <div className="mermaid-container">
                        {/* Mermaid will render the diagram here! */}
                        {!mermaidCode && !isLoading && !error && (
                            <p className="placeholder-text">Your flowchart will appear here.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnknotterPage;

