from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI

# --- SETUP AND PROVIDER SWITCHING ---
load_dotenv()
PROVIDER = os.getenv("PROVIDER", "openrouter").lower()

client = None
MODEL_NAME = ""

if PROVIDER == "groq":
    print("Using Groq provider.")
    client = OpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1",
    )
    MODEL_NAME = "llama-3.1-8b-instruct"
else: # Default to OpenRouter
    print("Using OpenRouter provider.")
    client = OpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
    )
    MODEL_NAME = "google/gemma-2-9b-it"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UPDATED REQUEST MODEL WITH HISTORY ---
class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None # <-- We now accept chat history
    name: str | None = None
    goals: list[str] | None = None
    challenges: list[str] | None = None
    tone: str | None = "casual, supportive"

@app.get("/health")
def health():
    return {"ok": True, "time": int(time.time())}

# --- UPGRADED CHAT FUNCTION WITH MEMORY ---
# In backend/main.py

@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    if not client:
        return {"error": "AI provider not configured correctly."}

    # --- THE UPGRADED SYSTEM PROMPT ---
    # Now it includes goals and challenges for hyper-personalization
    system_prompt = f"""
    You are the user's future self from 1 year from now.
    Your name is Future {req.name or 'Friend'}.
    Be supportive, concrete, and use a {req.tone} tone.
    Speak in 3-6 short sentences. Give realistic suggestions.

    Here is some critical context about your past self (the user):
    - Their goals: {', '.join(req.goals) if req.goals else 'Not specified'}
    - Their challenges: {', '.join(req.challenges) if req.challenges else 'Not specified'}

    Use this context to give highly specific and relevant advice. For example, if they mention a challenge, address it directly in your response.
    """

    messages = [{"role": "system", "content": system_prompt}]

    if req.history:
        messages.extend(req.history)

    messages.append({"role": "user", "content": req.message})

    try:
        chat_completion = client.chat.completions.create(
          messages=messages,
          model=MODEL_NAME,
          max_tokens=150
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Something went wrong with the AI call."}



class UnknotRequest(BaseModel):
    thoughts: str
    style: str | None = "flowchart"

# In backend/main.py

# In backend/main.py

@app.post("/unknot")
def unknot_thoughts(req: UnknotRequest):
    if not client:
        return {"error": "AI provider not configured correctly."}

    # --- THE NEW, BULLETPROOF PROMPT ---
    # This is much stricter to prevent bad output.
    prompt = f"""
    You are a system that converts a user's messy thoughts into a valid Mermaid flowchart.
    Your output MUST be ONLY the Mermaid code and nothing else. No explanations, no apologies, no extra text.
    The output must start with `graph TD;` and contain nodes and connections.

    Example Input: "I'm torn between getting a job and starting my own company. A job is safe but a company could be big."
    Example Output:
    graph TD;
        A[Dilemma: Job vs. Own Company] --> B[Option 1: Get a Job];
        A --> C[Option 2: Start Company];
        B --> B1[Pro: Safety & Security];
        C --> C1[Pro: High Potential];
        C --> C2[Con: High Risk];

    Now, process the following user thoughts: "{req.thoughts}"
    """

    messages = [{"role": "system", "content": prompt}]

    try:
        completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME, # Or your preferred model
            max_tokens=400,
            temperature=0.5 # A little more deterministic
        )
        
        mermaid_code = completion.choices[0].message.content.strip()
        
        # Final check to ensure it's valid-looking
        if not mermaid_code.strip().startswith('graph'):
             # If AI failed, send a generic error graph
             return {"mermaid": "graph TD; Error[AI failed to generate a valid graph. Please try rephrasing.]"}

        return {"mermaid": mermaid_code}
    except Exception as e:
        print(f"Error in unknot: {e}")
        return {"error": "Failed to unknot thoughts."}
