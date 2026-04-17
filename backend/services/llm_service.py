import os
from openai import AsyncOpenAI
from pydantic import BaseModel
import json

# Ensure groq key is loaded but use the OpenAI SDK structure
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class WebsiteCode(BaseModel):
    html: str
    css: str
    js: str

async def generate_website(prompt: str) -> dict:
    """
    Generates website code (HTML, CSS, JS) based on user prompt.
    Returns a dictionary with 'html', 'css', and 'js' keys.
    """
    system_prompt = """
You are an expert frontend developer and web designer. 
Generate a high-quality, modern, and aesthetically pleasing website based on the user's prompt.
The website MUST be completely responsive, functioning perfectly across Desktop, Tablet and Mobile views.
Provide valid HTML, CSS, and JS.
- IN THE HTML: Ensure you use semantic tags and MUST include `<meta name="viewport" content="width=device-width, initial-scale=1.0">` so mobile scaling works correctly.
- IN THE CSS: Use modern layouts (Flexbox/Grid), variables, and good typography. You MUST use CSS media queries (e.g. `@media (max-width: 768px)`) to gracefully stack elements on smaller screens. 
- IN THE JS: Add logic specifically for mobile interactivity if needed (e.g., a hamburger menu toggle).
Respond ONLY with a JSON object in this format:
{
    "html": "<html content>",
    "css": "<css content>",
    "js": "<js content>"
}
Do not include markdown blocks or any other explanation outside the JSON.
"""
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated to the currently active Llama 3.3 model on Groq
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        code_dict = json.loads(content)
        
        # Ensure fallback content if parsing is weird
        return {
            "html": code_dict.get("html", "<h1>Error generating HTML</h1>"),
            "css": code_dict.get("css", "body { font-family: sans-serif; }"),
            "js": code_dict.get("js", "console.log('Script loaded.');")
        }

    except Exception as e:
        print(f"Error in LLM generation: {e}")
        raise e
