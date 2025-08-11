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
@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    if not client:
        return {"error": "AI provider not configured correctly."}

    # 1. Start with the System Prompt (the AI's instructions)
    system_prompt = f"""
    You are the user's future self from 1 year from now.
    Your name is Future {req.name or 'Friend'}.
    Be supportive, concrete, and use a {req.tone} tone.
    Speak in 3-6 short sentences. Give realistic suggestions.
    """
    messages = [{"role": "system", "content": system_prompt}]

    # 2. Add the past conversation history
    if req.history:
        messages.extend(req.history)

    # 3. Add the user's new message
    messages.append({"role": "user", "content": req.message})

    try:
        chat_completion = client.chat.completions.create(
          messages=messages,
          model=MODEL_NAME, # Use the model for the selected provider
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

@app.post("/unknot")
def unknot_thoughts(req: UnknotRequest):
    if not client:
        return {"error": "AI provider not configured correctly."}

    # The prompt to generate Mermaid syntax
    prompt = f"""
    You are a thought organizer. Take the user's messy thoughts and turn them into clean, structured Mermaid syntax for a {req.style}.
    Keep it simple: 4-6 nodes max, with clear connections. Use labels like 'Idea' -> 'Action' -> 'Outcome'.
    Output ONLY the Mermaid code block, nothing else.

    User's thoughts: "{req.thoughts}"
    """

    # --- THIS IS THE FIX ---
    # We need a list `[]` of messages, not a set `{}`.
    messages = [{"role": "system", "content": prompt}]

    try:
        completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            max_tokens=300
        )
        mermaid_code = completion.choices[0].message.content.strip()
        return {"mermaid": mermaid_code}
    except Exception as e:
        print(f"Error in unknot: {e}")
        return {"error": "Failed to unknot thoughts."}
