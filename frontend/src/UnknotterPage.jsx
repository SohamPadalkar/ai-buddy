import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import './UnknotterPage.css';

// ... (your other imports and component code)

const UnknotterPage = ({ onBack }) => {
    const [thoughts, setThoughts] = useState('');
    const [mermaidCode, setMermaidCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // THIS IS THE CRUCIAL NEW PART
    useEffect(() => {
        // 1. Define our custom dark theme configuration
        mermaid.initialize({
            startOnLoad: false, // We control when it renders
            theme: 'base',      // We use 'base' so we can override variables
            themeVariables: {
                // --- Node & Text Colors ---
                primaryColor: '#1a1a2e',      // Node background
                primaryTextColor: '#ffffff',    // Node text color
                primaryBorderColor: '#ffffff', // Node border
                
                // --- Lines & Arrows ---
                lineColor: '#ffffff',
                arrowheadColor: '#ffffff',

                // --- Set any other potential colors to match our theme ---
                secondaryColor: '#1a1a2e',
                tertiaryColor: '#1a1a2e',
                noteBkgColor: '#1a1a2e',
                noteTextColor: '#ffffff',
                textColor: '#ffffff', // A general fallback for text
                background: '#121212' // The overall SVG background, can be transparent too
            }
        });

        // 2. This part renders the diagram when the code changes
        if (mermaidCode) {
            const container = document.querySelector('.mermaid-container');
            if (container) {
                try {
                    // Use the callback version of render to inject the SVG
                    mermaid.render('mermaid-graph', mermaidCode, (svgCode) => {
                        container.innerHTML = svgCode;
                    });
                } catch (e) {
                    // Handle potential errors from bad mermaid code
                    console.error("Mermaid render error:", e);
                    container.innerHTML = "Oops! The AI gave me a diagram I can't draw. Try rephrasing your thought.";
                }
            }
        }
    }, [mermaidCode]); // This effect runs whenever mermaidCode is updated


    const handleUnknot = async () => {
        if (!thoughts) return;
        setIsLoading(true);
        setMermaidCode(''); // Clear previous diagram
        
        try {
            const response = await axios.post('YOUR_BACKEND_URL/unknot', { thoughts });
            setMermaidCode(response.data.mermaid);
        } catch (error) {
            console.error("Error fetching mermaid diagram:", error);
            setMermaidCode("graph TD; Error[Could not connect to the server.];");
        } finally {
            setIsLoading(false);
        }
    };
    
    // ... (rest of your JSX and component logic)
    // Make sure your return statement has the container for the mermaid diagram
    return (
        <div className="page-container unknotter-page">
            {/* ... other elements ... */}
            <div className="mermaid-container">
                {isLoading && <p>Unknotting your thoughts...</p>}
                {/* The diagram will be injected here by the useEffect */}
            </div>
            {/* ... other elements ... */}
        </div>
    );
};

export default UnknotterPage;
