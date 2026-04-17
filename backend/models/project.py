from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    prompt: str
    html_content: str
    css_content: str
    js_content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "prompt": "A landing page for a coffee shop",
                "html_content": "<html>...</html>",
                "css_content": "body { ... }",
                "js_content": "console.log('hi');"
            }
        }
