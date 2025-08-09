from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import time
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# --- NEW: We are using the OpenAI library now ---
from openai import OpenAI

# --- SETUP THE NEW AI ---
load_dotenv()
# We create a client pointing to Together AI's server
client = OpenAI(
  api_key=os.getenv("TOGETHER_API_KEY"),
  base_url="https://api.together.xyz/v1",
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    name: str | None = None
    goals: list[str] | None = None
    challenges: list[str] | None = None
    tone: str | None = "casual, supportive"

@app.get("/health")
def health():
    return {"ok": True, "time": int(time.time())}

@app.post("/chat")
def chat_with_ai(req: ChatRequest):
    # The prompt is exactly the same! No changes needed here.
    prompt = f"""
    You are the user's future self from 1 year from now.
    Your name is Future {req.name or 'Friend'}.
    Be supportive, concrete, and use a {req.tone} tone.
    Speak in 3-6 short sentences. Give realistic suggestions.

    Here is some context about your past self:
    - Their goals: {req.goals or 'Not provided'}
    - Their current challenges: {req.challenges or 'Not provided'}

    Your past self just said this to you: "{req.message}"

    Respond as their wise and caring future self.
    """

    try:
        # --- This is the new way we call the AI ---
        chat_completion = client.chat.completions.create(
          messages=[
            {
              "role": "system",
              "content": prompt,
            },
            {
              "role": "user",
              "content": req.message,
            }
          ],
          # We can choose any model we want from Together AI's list!
          # 'mistralai/Mixtral-8x7B-Instruct-v0.1' is a powerful free one.
          model="mistralai/Mixtral-8x7B-Instruct-v0.1",
          max_tokens=150 # Limit the length of the reply
        )
        
        # We get the reply from the new response format
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Something went wrong with the AI call."}

