from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import traceback
import re
from together import Together

# Load .env file
load_dotenv()
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

# Initialize Together SDK client
client = Together(api_key=TOGETHER_API_KEY)

app = FastAPI()

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema
class UserQuery(BaseModel):
    task: str
    question: str
    language: str = "Python"
    code: str = ""

# Helper to strip Markdown from bot output
def strip_markdown(text):
    # Remove markdown headers, bold/italic, and excess newlines
    text = re.sub(r"\*{1,2}(.*?)\*{1,2}", r"\1", text)  # bold/italic
    text = re.sub(r"#+\s*", "", text)  # headers
    text = re.sub(r"\n{2,}", "\n", text)  # collapse multiple newlines
    return text.strip()
@app.post("/ask")
async def handle_query(query: UserQuery):
    system_prompt = ""
    user_prompt = ""

    if query.task == "Explain":
        system_prompt = (
            "You are a DSA tutor. Your name is IE-Fixxy. Break down the following problem into:\n"
            "1. Summary\n2. Concepts involved\n3. Constraints and edge cases\n4. Step-by-step approach\n"
            "As a DSA tutor please dont entertain any additional questions just answer DSA related questions, also reply in a polite tone when encountered off topic questions"
        )
        user_prompt = query.question

    elif query.task == "Solve":
        system_prompt = (
            "You are a coding assistant. Provide a correct and efficient solution to the problem. "
            "Include time and space complexity. Use best practices."
        )
        user_prompt = f"Problem:\n{query.question}\nLanguage: {query.language}"

    elif query.task == "Debug":
        system_prompt = (
            "You are a coding debugger. Identify the bugs, explain them clearly, and provide a fixed version."
        )
        user_prompt = f"Language: {query.language}\nBuggy Code:\n{query.code}"

    elif query.task == "TestCases":
        system_prompt = (
            "You are a test case generator. Provide test cases including:\n"
            "1. Basic examples\n2. Edge cases\n3. Stress tests\n"
            "Each should have Input and Expected Output."
        )
        user_prompt = query.question

    else:
        return {"answer": "Invalid task selected."}

    try:
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1024,
        )

        raw_reply = response.choices[0].message.content
        clean_reply = strip_markdown(raw_reply)

        return {"answer": clean_reply}

    except Exception as e:
        traceback.print_exc()
        return {"answer": f"An error occurred: {str(e)}"}
@app.get("/")
def read_root():
    return {"message": "IE-Fixxy backend is running!"}



# (env) D:\IE navi Doubt Solver\backend>.\env\Scripts\activate

# (env) D:\IE navi Doubt Solver\backend>uvicorn main:app --reload --port 8000
