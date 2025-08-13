from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI
import json

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

# --- REQUEST MODELS ---
class ChatRequest(BaseModel):
    message: str
    history: list[dict]
    name: str

class UnknotRequest(BaseModel):
    thoughts: str

class RecommendRequest(BaseModel):
    history: List[Dict[str, str]]

class SimulationRequest(BaseModel):
    story_id: str
    last_choice: Optional[str] = None
    turn_count: int

# --- ENDPOINTS ---
@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    if not client:
        return {"error": "AI provider not configured."}

    system_prompt = f"""
    You are the user's future self from 1 year from now. Your name is Future {req.name or 'Friend'}.
    Be supportive, concrete, and use a casual, supportive tone. Speak in 3-6 short sentences.
    Give realistic suggestions based on the conversation.
    """
    messages = [{"role": "system", "content": system_prompt}]
    if req.history:
        messages.extend(req.history)
    messages.append({"role": "user", "content": req.message})

    try:
        chat_completion = client.chat.completions.create(
            messages=messages, model=MODEL_NAME, max_tokens=150
        )
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print(f"Error in chat: {e}")
        return {"error": "Something went wrong with the AI call."}

# In your backend/main.py file

# In your backend/main.py

# In your backend/main.py

@app.post("/unknot")
def unknot_thoughts(req: UnknotRequest):
    if not client:
        return {"error": "AI provider not configured."}

    # === PROMPT FOR THE FIRST ATTEMPT ===
    generation_prompt = f"""
You are an expert problem-solving assistant who visualizes solutions. Your task is to create a Mermaid flowchart using `graph TD` syntax.

1.  Clarify the Problem: Map out the user's core issues and feelings. For these problem/feeling nodes, use standard rectangular nodes.
    *   Example: `A[Feeling overwhelmed]`

2.  Provide Solutions: For each problem, create a node with a concrete, actionable next step. For these solution nodes, use a "stadium" shape to make them stand out.
    *   Example: `B(Break project into tiny 15-min tasks)`

The final flowchart must be a single, connected graph.

User's Thoughts:
---
{req.thoughts}
---

CRITICAL INSTRUCTIONS:
- Your output MUST be ONLY the raw Mermaid code.
- Do not include explanations, apologies, or the word "mermaid".
- Start your response immediately with `graph TD;`.
"""

    try:
        # --- FIRST ATTEMPT ---
        messages = [{"role": "system", "content": generation_prompt}]
        completion = client.chat.completions.create(
            messages=messages, model=MODEL_NAME, max_tokens=400, temperature=0.5
        )
        mermaid_code = completion.choices[0].message.content.strip()

        # --- VALIDATION & REPAIR LOOP ---
        # A simple sanity check. If it's invalid, try to repair it.
        if not mermaid_code.startswith('graph TD'):
            
            # --- SECOND ATTEMPT (THE REPAIR) ---
            repair_prompt = f"""
The following Mermaid code has a syntax error. It should start with 'graph TD;'.
Please fix it and provide ONLY the corrected, valid Mermaid code block.

Broken Code:
---
{mermaid_code}
---
"""
            repair_messages = [{"role": "system", "content": repair_prompt}]
            
            # Call the AI again to fix its own mistake
            repair_completion = client.chat.completions.create(
                messages=repair_messages, model=MODEL_NAME, max_tokens=400, temperature=0.3
            )
            mermaid_code = repair_completion.choices[0].message.content.strip()


        # Final check before sending to frontend
        if not mermaid_code.startswith('graph'):
             return {"mermaid": "graph TD; Error[Sorry, the AI is having trouble and could not generate a valid graph. Please try again.]"}

        return {"mermaid": mermaid_code}

    except Exception as e:
        print(f"Critical error in unknot after repair attempt: {e}")
        return {"error": "Failed to unknot thoughts due to a server error."}





@app.post("/recommend")
def get_recommendation(req: RecommendRequest):
    if not client:
        return {"error": "AI provider not configured."}

    history_text = " ".join([msg['content'] for msg in req.history])
    prompt = f"""
    Based on this recent conversation sentiment: "{history_text}", suggest a helpful YouTube video, a book, and a movie.
    Respond with ONLY a valid JSON object containing a key "recommendations" which is a list of 3 objects.
    Each object must have three keys: "type", "title", and "query".
    Example: {{"recommendations": [{{"type": "youtube", "title": "A Guided Morning Meditation", "query": "10 minute guided morning meditation"}}]}}
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

@app.post("/simulation")
def advance_simulation(req: SimulationRequest):
    if not client:
        return {"error": "AI provider not configured."}

    story_prompts = {"nova-1": "You are a calm narrator for an interactive mental simulation called 'The Nova-1 Emergency', a sci-fi adventure about staying calm under pressure."}
    base_prompt = story_prompts.get(req.story_id, "You are a master storyteller.")

    if req.turn_count >= 5:
        instruction = f"The user just chose '{req.last_choice}'. This is the final turn. Conclude the story with a satisfying, reflective ending. Then, give two final options: 'Play Again' and 'Return to Hub'."
    elif req.last_choice:
        instruction = f"The user just chose '{req.last_choice}'. Continue the story for ONE or TWO short sentences. Then, present three new, distinct choices."
    else:
        instruction = "Start the story with an engaging opening (one or two sentences). Then, present the first three choices."

    prompt = f"""
    {base_prompt}
    {instruction}
    Keep the story_text concise.
    Your response MUST be a valid JSON object with "story_text" (string) and "choices" (list of strings).
    """
    messages = [{"role": "system", "content": prompt}]
    
    try:
        completion = client.chat.completions.create(
            messages=messages, model=MODEL_NAME, response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Error in simulation: {e}")
        return {"error": "Failed to advance the simulation."}
