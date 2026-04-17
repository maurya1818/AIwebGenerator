from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_service import generate_website

router = APIRouter(
    prefix="/api/generate",
    tags=["Generate"]
)

class PromptRequest(BaseModel):
    prompt: str

class GenerationResponse(BaseModel):
    html: str
    css: str
    js: str

@router.post("/", response_model=GenerationResponse)
async def generate_site(request: PromptRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    try:
        # Call the LLM service to generate the site
        result = await generate_website(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
