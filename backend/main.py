from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from pydantic import BaseModel, Field
from typing import List, Dict
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

# --- SETUP AND PROVIDER SWITCHING ---
load_dotenv()
PROVIDER = os.getenv("PROVIDER", "openrouter").lower()

client = None
MODEL_NAME = ""

# ... (rest of your provider setup code is the same)
if PROVIDER == "groq":
    print("Using Groq provider.")
    client = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
    MODEL_NAME = "llama-3.1-8b-instruct"
else:
    print("Using OpenRouter provider.")
    client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1")
    MODEL_NAME = "google/gemma-2-9b-it"


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REQUEST MODELS ---
class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None
    name: str | None = None
    goals: list[str] | None = None
    challenges: list[str] | None = None
    tone: str | None = "casual, supportive"

class UnknotRequest(BaseModel):
    thoughts: str

class RecommendRequest(BaseModel):
    history: List[Dict[str, str]]

# --- ENDPOINTS ---
@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    # ... (this function remains the same)
    if not client: return {"error": "AI provider not configured."}
    system_prompt = f"You are the user's future self from 1 year from now. Your name is Future {req.name or 'Friend'}. Be supportive, concrete, and use a {req.tone} tone. Speak in 3-6 short sentences. Context: Their goals are {', '.join(req.goals) if req.goals else 'N/A'} and challenges are {', '.join(req.challenges) if req.challenges else 'N/A'}. Use this to give specific advice."
    messages = [{"role": "system", "content": system_prompt}]
    if req.history: messages.extend(req.history)
    messages.append({"role": "user", "content": req.message})
    try:
        chat_completion = client.chat.completions.create(messages=messages, model=MODEL_NAME, max_tokens=150)
        return {"reply": chat_completion.choices[0].message.content}
    except Exception as e:
        print(f"Error in chat: {e}")
        return {"error": "Failed to chat"}

@app.post("/unknot")
def unknot_thoughts(req: UnknotRequest):
    # ... (this function remains the same)
    if not client: return {"error": "AI provider not configured."}
    prompt = f'You convert messy thoughts into a valid Mermaid flowchart. Output ONLY the Mermaid code starting with `graph TD;`. Thoughts: "{req.thoughts}"'
    messages = [{"role": "system", "content": prompt}]
    try:
        completion = client.chat.completions.create(messages=messages, model=MODEL_NAME, max_tokens=400, temperature=0.5)
        mermaid_code = completion.choices[0].message.content.strip()
        if not mermaid_code.startswith('graph'): return {"mermaid": "graph TD; Error[AI failed to generate a valid graph.]"}
        return {"mermaid": mermaid_code}
    except Exception as e:
        print(f"Error in unknot: {e}")
        return {"error": "Failed to unknot"}

# --- THE NEW AND IMPROVED RECOMMENDATION ENDPOINT ---
@app.post("/recommend")
def get_recommendation(req: RecommendRequest):
    if not client:
        return {"error": "AI provider not configured."}

    history_text = " ".join([msg['content'] for msg in req.history])

    prompt = f"""
    Based on this recent conversation sentiment: "{history_text}", 
    suggest a helpful YouTube video, a book, and a movie.
    
    Respond with ONLY a valid JSON object containing a key "recommendations" which is a list of 3 objects.
    Each object must have three keys: "type" (youtube, book, or movie), "title", and "query" (a good search term for the item).

    Example:
    {{
      "recommendations": [
        {{"type": "youtube", "title": "A 10-Minute Guided Morning Meditation", "query": "10 minute guided morning meditation for focus"}},
        {{"type": "book", "title": "Atomic Habits by James Clear", "query": "Atomic Habits James Clear book summary"}},
        {{"type": "movie", "title": "Inside Out (2015)", "query": "Inside Out 2015 movie trailer"}}
      ]
    }}
    """

    messages = [{"role": "system", "content": prompt}]
    
    try:
        completion = client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            response_format={"type": "json_object"}
        )
        response_data = json.loads(completion.choices[0].message.content)
        return response_data
    except Exception as e:
        print(f"Error in recommendation: {e}")
        return {"error": "Failed to get recommendation"}
