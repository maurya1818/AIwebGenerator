from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables FIRST before importing routers that depend on them
load_dotenv()

from routers import generator

app = FastAPI(
    title="AI-Powered Website Generator API",
    description="Backend API for generating websites using LLMs",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generator.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Website Generator API is running"}
