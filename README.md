# AI Website Generator

An AI-powered website generator that transforms natural language prompts into fully functional, responsive websites using Llama 3.3 and Groq. The application gives you immediate live previews of the generated HTML, CSS, and JS, along with a built-in code editor and export capabilities.

## System Architecture and Component Overview

The application is built on a modern, monolithic **React + FastAPI** stack, designed to be deployed as a single project on Vercel.

### 1. Frontend (Client-Side)
- **Framework**: React.js configured with Vite.
- **Core Logic**: Manages application state, handles user prompts, and provides a real-time live preview using an injected `iframe`.
- **Features**: Live Preview/Code Editor toggling, syntax editing, and `.zip` exporting.
- **Location**: `/frontend`

### 2. Backend (Server-Side)
- **Framework**: Python FastAPI.
- **Core Logic**: Provides high-performance async endpoints that interface with the LLM API to convert textual prompts into structured code objects (HTML/CSS/JS).
- **Location**: `/backend`

### 3. Deployment Configuration (`vercel.json`)
- Resolves the monorepo deployment by orchestrating Vite's static build output to the root (`/`) while exposing the Python FastAPI instance as a Serverless function running on the `/api/*` path.

---

## API Endpoint Documentation

### `POST /api/generate/`
Generates website code (HTML, CSS, JS) based on a descriptive natural language prompt.

**Request Body (JSON):**
```json
{
  "prompt": "A landing page for a modern coffee shop with a dark theme and an 'Order Now' button."
}
```

**Successful Response (200 OK):**
```json
{
  "html": "<main><h1>Coffee Shop</h1>...</main>",
  "css": "body { background-color: #1a1a1a; }...",
  "js": "document.querySelector('.btn').addEventListener('click', ...)"
}
```

**Error Responses:**
- `400 Bad Request`: If the prompt parameter is empty or missing.
- `500 Internal Server Error`: For invalid API keys or LLM generation failures.

---

## Model Selection and Integration Rationale

### Model: `llama-3.3-70b-versatile`
- **Why Llama 3.3 70B?**: The 70B variant of Llama 3 is highly capable of understanding spatial design requests and robust code generation. It consistently outputs well-structured syntax and follows strict JSON schemas smoothly.
- **Why Groq?**: Live rendering of websites requires extremely fast Time-To-First-Token (TTFT) and high token generation speed. Built on specialized LPUs, Groq generates entire website code snippets almost instantaneously compared to traditional commercial models, vastly decreasing waiting time for the end user and providing a premium UX. 
- **Integration Approach**: Although we use Groq, the backend utilizes the official `AsyncOpenAI` Python SDK configured with a base URL of `https://api.groq.com/openai/v1`. This integration rationale ensures maximum compatibility; allowing us to hot-swap to actual OpenAI models, Deepseek, or vLLM instances in the future without rewriting any integration infrastructure.

---

## Deployment and Setup Instructions

### Local Development Setup

**1. Clone the repository and navigate to the project directory**

**2. Setup Backend:**
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
```
*Create a `.env` file in the `backend` directory matching `.env.example` and add your `GROQ_API_KEY`.*
```bash
# Run local REST API
uvicorn main:app --reload --port 8000
```

**3. Setup Frontend:**
Open a new terminal window.
```bash
cd frontend
npm install
# Start local Vite server
npm run dev
```

### Vercel Deployment Setup

This project is tailored for zero-config deployments to Vercel. 

1. **Push to GitHub**: Ensure your code is pushed to your remote repository.
2. **Import Project**: In the Vercel Dashboard, import the repository.
3. **Configure Settings**:
   - Leave the "Framework Preset" as **Vite** (if auto-detected) or **Other**.
   - Ensure "Root Directory" is set to the **root** of the repository (leave it blank/empty), *not* `frontend`.
4. **Environment Variables**: Head to your Vercel Project Settings > Environment Variables, and securely add your `GROQ_API_KEY`.
5. **Deploy**: Trigger a deployment. Vercel will process `vercel.json`, build the React app, configure FastAPI as a serverless instance, and successfully align your URLs!
