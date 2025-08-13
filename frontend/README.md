# 🤖 AI Buddy: Your Personal Mind-Mapping Companion

  <!-- We'll make a cool screenshot for this later! -->

**AI Buddy is a web application designed for mental clarity and personal growth, built for the ReverieHacks 2025 hackathon.** It provides a suite of AI-powered tools to help users untangle their thoughts, chat with their "future self," and embark on guided mental simulations.

---

## ✨ Features

Our app is built around three core experiences designed to provide support and clarity:

*   **Future Self Chat:** An interactive chat experience where you can get personalized advice and encouragement from an AI modeled to be your wiser, future self. It uses your chat history to provide context-aware responses.
*   **Thought Unknotter:** A powerful visualization tool. Simply paste your messy, tangled thoughts, and our AI will generate a clean, structured Mermaid flowchart to help you see the connections and find a path forward.
*   **Guided Simulations:** Embark on interactive, narrative-driven mental adventures. These stories, powered by AI, present you with choices that help build resilience, creativity, and problem-solving skills.

---

## 🛠️ Tech Stack

We used a modern, robust stack to bring AI Buddy to life.

### Frontend (Built with React)
*   **Framework:** React.js
*   **Styling:** Plain CSS with a mobile-first, responsive design approach.
*   **API Communication:** Axios
*   **Diagrams:** Mermaid.js for rendering the AI-generated flowcharts.

### Backend (Built with Python)
*   **Framework:** FastAPI
*   **AI Integration:** OpenAI API (for GPT models)
*   **CORS:** `fastapi.middleware.cors` to connect the frontend and backend.

---

## 🚀 Getting Started

Want to run AI Buddy on your local machine? Here’s how:

### Prerequisites

*   Node.js and npm installed
*   Python 3.x and pip installed
*   An OpenAI API key

### Installation & Setup

1.  **Clone the repository:**
    ```
    git clone https://github.com/SohamPadalkar/ai-buddy.git
    cd ai-buddy
    ```

2.  **Setup the Backend:**
    *   Navigate to the backend directory: `cd backend`
    *   Create a virtual environment: `python -m venv venv`
    *   Activate it:
        *   Windows: `venv\Scripts\activate`
        *   macOS/Linux: `source venv/bin/activate`
    *   Install dependencies: `pip install -r requirements.txt`
    *   Create a `.env` file and add your OpenAI API key:
        ```
        OPENAI_API_KEY=your_secret_key_here
        ```
    *   Start the server: `uvicorn main:app --reload`

3.  **Setup the Frontend:**
    *   In a new terminal, navigate to the frontend directory: `cd frontend`
    *   Install dependencies: `npm install`
    *   Start the React app: `npm start`

4.  **Launch the App!**
    *   Open your browser and go to `http://localhost:3000`. The app should be live and connected to your local backend server.

---