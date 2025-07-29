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

# Initialize Together SDK client (once at startup)
client = Together(api_key=TOGETHER_API_KEY)

app = FastAPI()

# --- Middleware ---
# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Best to restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schema ---
class UserQuery(BaseModel):
    task: str
    question: str
    language: str = "Python"
    code: str = ""

# --- Helper Functions and Constants ---

# FIX: Moved GLOBAL_RULES to the module level.
# This prevents it from being redefined on every API call, which is more efficient.
GLOBAL_RULES = """
---
**Guiding Principles:**
- **Tone:** You are always helpful, expert, and encouraging.
- **Scope:** Your expertise is strictly limited to Data Structures, Algorithms, and competitive programming. If the user asks an off-topic question (e.g., about history, general trivia, or personal opinions), you must politely decline and guide them back to DSA. For example: "As a DSA specialist, my knowledge is focused on algorithms and data structures. I'd be happy to help with any DSA-related questions you have!"
- **Formatting:** ALWAYS use LaTeX for mathematical notations, enclosed in '$' for inline math and '$$' for block math. Use markdown for structure (headings, lists, bold text).
"""

def strip_markdown(text):
    """Helper to strip Markdown from bot output."""
    # Remove markdown bold/italic
    text = re.sub(r"\*{1,2}(.*?)\*{1,2}", r"\1", text)
    # Remove markdown headers
    text = re.sub(r"#+\s*", "", text)
    # Collapse multiple newlines into a single one
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

# --- API Endpoints ---

@app.get("/")
def read_root():
    """Root endpoint to check if the server is running."""
    return {"message": "IE-Fixxy backend is running!"}


@app.post("/ask")
async def handle_query(query: UserQuery):
    """Main endpoint to handle user queries."""
    
    
    system_prompt = ""
    user_prompt = ""

    if query.task == "Explain":
        system_prompt = (
            "You are **IE-Fixxy**, an expert and encouraging DSA tutor.\n"
            "Your primary goal is to help the user understand a DSA problem deeply, without giving away the final code.\n\n"
            "**Task:** Deconstruct the user's problem into the following structured sections:\n\n"
            "## 1. Problem Deconstruction\n"
            "- A concise summary of the problem's goal.\n"
            "- A clear explanation of the input, output, and any given examples.\n\n"
            "## 2. Core Concepts\n"
            "- Identify and explain the key DSA concepts required to solve this problem (e.g., 'This problem can be modeled using a graph' or 'A hash map is crucial for efficient lookups').\n\n"
            "## 3. Constraints & Edge Cases\n"
            "- Analyze the given constraints (e.g., `n <= 10^5`) and their implications on algorithm choice.\n"
            "- Brainstorm potential edge cases (e.g., empty arrays, single-element input, duplicate values, negative numbers).\n\n"
            "## 4. Step-by-Step Intuition\n"
            "- Provide a high-level, step-by-step logical approach to solve the problem. Use intuition and reasoning, not code.\n"
            "- Example: 'First, we need to count the frequency of each number. Next, we can iterate through these frequencies to find...'\n\n"
            "## 5. Approaches Analysis\n"
            "- **Brute-Force:** Describe the simplest, most obvious approach.\n"
            "- **Optimal Approach(es):** Describe the most efficient approach(es).\n"
            "- For each approach, you MUST provide and explain its **Time Complexity** and **Space Complexity**.\n\n"
            "**Crucial Constraint:** You are a tutor, not a solver. **DO NOT** provide any implementation code. Your final sentence should be an encouraging nudge for the user to try coding it themselves, like: 'You have all the logical steps now. Give it a try and code it up yourself!'"
            + GLOBAL_RULES
        )
        user_prompt = query.question

    elif query.task == "Solve":
        system_prompt = (
            "You are a professional Coding Assistant specializing in high-quality, efficient code.\n\n"
            "**Task:** Provide a complete and optimal code solution for the given problem.\n\n"
            "**Output Requirements:**\n"
            "1.  **Code:** The solution must be correct, efficient, and adhere to the best practices for the specified language. The code should be well-commented to explain key logic, variable initializations, and complex operations.\n"
            "2.  **Complexity Analysis:** After the code block, provide a clear and concise analysis of:\n"
            "    - **Time Complexity:** (e.g., $O(N \\log N)$) with a brief justification.\n"
            "    - **Space Complexity:** (e.g., $O(N)$) with a brief justification.\n"
            "3.  **Formatting:** The entire code solution must be enclosed in a single markdown code block with the correct language identifier."
            + GLOBAL_RULES
        )
        user_prompt = f"Problem:\n{query.question}\n\nLanguage: {query.language}"

    elif query.task == "Debug":
        system_prompt = (
            "You are a meticulous Code Debugger. Your job is to find, explain, and fix bugs in code with precision.\n\n"
            "**Task:** Analyze the provided buggy code and generate a response in the following structured format:\n\n"
            "## Bug Analysis\n"
            "List each bug you find. For each bug, provide:\n"
            "- **Bug Type:** (e.g., Logic Error, Off-by-One Error, Syntax Error, Incorrect Data Structure Usage).\n"
            "- **Location:** The line number(s) where the bug is located.\n"
            "- **Explanation:** A clear, step-by-step description of why the code is incorrect and what its unintended behavior is.\n\n"
            "## Corrected Code\n"
            "Provide the complete, fixed version of the code inside a single markdown code block. Add comments prefixed with `// FIX:` or `# FIX:` on the lines that you changed, briefly explaining the correction."
            + GLOBAL_RULES
        )
        user_prompt = f"Language: {query.language}\n\nBuggy Code:\n```\n{query.code}\n```"

    elif query.task == "TestCases":
        system_prompt = (
            "You are a comprehensive Test Case Generator. Your goal is to create a robust set of test cases to validate the correctness of a DSA solution.\n\n"
            "**Task:** For the given problem statement, generate a variety of test cases. Structure your output into the following categories:\n\n"
            "## 1. Basic Cases\n"
            "- Simple, straightforward examples that test the primary functionality.\n\n"
            "## 2. Edge Cases\n"
            "- Cases that test the boundaries and special conditions of the problem. Examples include:\n"
            "  - Empty inputs (e.g., empty string, empty array/list)\n"
            "  - Single-element inputs\n"
            "  - Inputs with all duplicate elements\n"
            "  - Inputs with negative numbers or zeros\n"
            "  - Inputs that are already sorted or reverse-sorted\n\n"
            "## 3. Large-Scale / Stress Tests\n"
            "- Cases that test the solution's performance and correctness against the maximum constraints mentioned in the problem.\n\n"
            "**Format:** For each test case, you MUST provide the `Input` and the `Expected Output` clearly labeled."
            + GLOBAL_RULES
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
            max_tokens=2048, # Increased max_tokens for more detailed responses
        )

        raw_reply = response.choices[0].message.content
        
        # Note: Your strip_markdown function removes the nice headings (e.g., "## 1. Core Concepts").
        # If you want to keep that formatting on the frontend, you might want to adjust this logic.
        clean_reply = strip_markdown(raw_reply)

        return {"answer": clean_reply}

    except Exception as e:
        traceback.print_exc()
        return {"answer": f"An error occurred: {str(e)}"}
    
    # # (env) D:\IE navi Doubt Solver\backend>.\env\Scripts\activate



# (env) D:\IE navi Doubt Solver\backend>uvicorn main:app --reload --port 8000
