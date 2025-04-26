from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from ai_assistant import StoryAIAssistant
import uuid

app = FastAPI()

# Configure CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    story_id: Optional[str] = None
    mainCharacter: str
    setting: str
    genre: str
    tone: str
    additionalDetails: Optional[str] = None

class ChapterInfo(BaseModel):
    chapter_number: int
    summary: str

class StoryProgress(BaseModel):
    total_chapters: int
    chapters: List[ChapterInfo]

class StoryResponse(BaseModel):
    story_id: str
    chapter_number: int
    content: str
    total_chapters: int

# Create a single instance of StoryAIAssistant to maintain story history
ai_assistant = StoryAIAssistant()

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "Story Generator API is running"}

@app.post("/api/generate-story", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    try:
        # Generate or use existing story_id
        story_id = request.story_id or str(uuid.uuid4())
        
        # Generate the next chapter
        result = await ai_assistant.generate_story(
            story_id=story_id,
            main_character=request.mainCharacter,
            setting=request.setting,
            genre=request.genre,
            tone=request.tone,
            additional_details=request.additionalDetails
        )
        
        return StoryResponse(
            story_id=story_id,
            chapter_number=result['chapter_number'],
            content=result['content'],
            total_chapters=result['total_chapters']
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/api/story-progress/{story_id}", response_model=StoryProgress)
async def get_story_progress(story_id: str):
    try:
        progress = ai_assistant.get_story_progress(story_id)
        return progress
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 