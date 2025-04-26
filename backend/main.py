from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from ai_assistant import StoryAIAssistant

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    mainCharacter: str
    setting: str
    genre: str
    tone: str
    additionalDetails: Optional[str] = None

class StoryResponse(BaseModel):
    story: str

@app.post("/api/generate-story", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    try:
        ai_assistant = StoryAIAssistant()
        story = await ai_assistant.generate_story(
            main_character=request.mainCharacter,
            setting=request.setting,
            genre=request.genre,
            tone=request.tone,
            additional_details=request.additionalDetails
        )
        return StoryResponse(story=story)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 