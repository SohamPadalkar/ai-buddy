 🤖 AI Buddy: A Multi-Tool Approach to Mental Clarity

![20250823-1345-31 5416981](https://github.com/user-attachments/assets/6b9f4493-6941-4f84-834e-4671c0779f71)


**AI Buddy** is an innovative personal AI assistant designed to help users **untangle thoughts**, gain **emotional clarity**, and receive **personalized growth guidance** through a suite of powerful, prompt-engineered tools.  

This project was built for **Reverie Hacks 2025** and demonstrates a robust, multi-feature application powered by modern AI and web technologies.

---

## ✨ Core Features

- **🧩 Thought Unknotter**  
  Converts messy, unstructured thoughts into a **clean, logical flowchart** using Mermaid.js — offering instant clarity on complex emotional and practical problems.  

- **🕰 Future Self Chat**  
  An empathetic AI chatbot that adopts the persona of your *future self*. It provides supportive, actionable advice rooted in positive psychology.  

- **📚 Smart Recommendations**  
  Analyzes chat history sentiment to suggest **YouTube videos, books, and movies** tailored to your needs.  

- **🎭 Guided Simulations**  
  Interactive, choice-based mental fitness adventures powered by a **stateful AI storyteller** — practice resilience and decision-making in a safe, engaging environment.  

---

## 🛠 Tech Stack

**Frontend: React**  
- Dynamic single-page application  
- Styled with **pure CSS** for speed and simplicity  
- Uses **axios** for API calls & **mermaid.js** for graph rendering  

**Backend: FastAPI (Python)**  
- High-performance async API framework  
- **Pydantic** for robust data validation  

**AI & LLMs**  
- **Provider Switching**: Choose OpenRouter or Groq via environment variables  
- **Models**:  
  - `google/gemma-2-9b-it` (via OpenRouter)  
  - `llama-3.1-8b-instruct` (via Groq)  
- **Prompt Engineering**: Every feature powered by a custom-designed prompt for **structured, reliable outputs**  

---

## 🚀 Getting Started

### ✅ Prerequisites
- Python **3.8+**  
- Node.js & npm (or yarn)  
- API keys for **OpenRouter** or **Groq**  

---

### 📥 Installation & Setup

Clone the repository:

```bash
git clone https://github.com/your-username/ai-buddy.git
cd ai-buddy
🔹 Backend Setup
bash
Copy
Edit
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend/ directory and add your keys:

env
Copy
Edit
# Provider: "openrouter" or "groq"
PROVIDER="openrouter"

OPENROUTER_API_KEY="your-openrouter-key"
GROQ_API_KEY="your-groq-key"
🔹 Frontend Setup
bash
Copy
Edit
cd ../frontend
npm install
▶ Running the Application
Start the backend (from /backend):

bash
Copy
Edit
uvicorn main:app --reload
Backend runs at: http://127.0.0.1:8000

Start the frontend (from /frontend):

bash
Copy
Edit
npm start
Frontend opens at: http://localhost:3000

📂 Project Structure

├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   └── index.js
    └── package.json
🌟 Future Enhancements
User accounts with session storage

Integration with journaling apps

Offline-first mode with local AI models

