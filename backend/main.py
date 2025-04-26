from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Literal
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

class PreservedElement(BaseModel):
    type: Literal["character", "event"]
    name: str
    importance: float

class AlternativeChapterRequest(BaseModel):
    story_id: str
    chapter_id: str
    chapter_content: str
    story_context: Optional[str] = None
    preserved_elements: List[PreservedElement]

class AlternativeChapter(BaseModel):
    id: str
    content: str
    summary: str
    key_differences: List[str]
    preserved_elements: List[PreservedElement]

class BranchPreview(BaseModel):
    summary: str
    key_differences: List[str]
    continuity_issues: List[str]
    compatibility_score: float

class BranchValidation(BaseModel):
    is_valid: bool
    continuity_issues: List[str]
    compatibility_score: float

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

class PlotAnalysisRequest(BaseModel):
    story: str  # Full story from the user

class PlotAnalysisResponse(BaseModel):
    plot_summary: str
    strengths: list[str]
    areas_for_improvement: list[str]
    narrative_structure: dict
    alternatives: dict

@app.post("/api/plot-analysis", response_model=PlotAnalysisResponse)
async def plot_analysis(request: PlotAnalysisRequest):
    try:
        ai_assistant = StoryAIAssistant()
        analysis = await ai_assistant.analyze_story(request.story)

        return PlotAnalysisResponse(
            plot_summary=analysis["plot_summary"],
            strengths=analysis["strengths"],
            areas_for_improvement=analysis["areas_for_improvement"],
            narrative_structure=analysis["narrative_structure"],
            alternatives=analysis["alternatives"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-branch")
async def generate_alternative_chapters(request: AlternativeChapterRequest) -> List[AlternativeChapter]:
    try:
        # Get the AI assistant to generate alternatives
        alternatives = await ai_assistant.generate_alternative_branches(
            chapter_content=request.chapter_content,
            story_context=request.story_context,
            preserved_elements=[element.dict() for element in request.preserved_elements]
        )
        
        # Transform the alternatives into the expected format
        return [
            AlternativeChapter(
                id=str(uuid.uuid4()),
                content=alt["content"],
                summary=alt["summary"],
                key_differences=alt["key_differences"],
                preserved_elements=[PreservedElement(**pe) for pe in alt["preserved_elements"]]
            )
            for alt in alternatives
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/preview-branch/{story_id}/{branch_id}", response_model=BranchPreview)
async def preview_branch(story_id: str, branch_id: str):
    try:
        # Get the original chapter and branch content
        # For now, we'll use mock data since we don't have storage
        # In a real implementation, you'd fetch this from a database
        original_content = "Original chapter content..."
        branch_content = "Branch content..."
        preserved_elements = []

        # Validate the branch
        validation = await ai_assistant.validate_branch(
            original_content=original_content,
            branch_content=branch_content,
            preserved_elements=preserved_elements
        )
        
        return BranchPreview(
            summary=branch_content[:200] + "...",  # First 200 characters as summary
            key_differences=validation.get("key_differences", []),
            continuity_issues=validation.get("continuity_issues", []),
            compatibility_score=validation.get("compatibility_score", 0.85)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/validate-branch/{story_id}/{branch_id}", response_model=BranchValidation)
async def validate_branch(story_id: str, branch_id: str):
    try:
        # Get the original chapter and branch content
        # For now, we'll use mock data since we don't have storage
        original_content = "Original chapter content..."
        branch_content = "Branch content..."
        preserved_elements = []

        # Validate the branch using AI
        validation = await ai_assistant.validate_branch(
            original_content=original_content,
            branch_content=branch_content,
            preserved_elements=preserved_elements
        )
        
        return BranchValidation(
            is_valid=validation["is_valid"],
            continuity_issues=validation["continuity_issues"],
            compatibility_score=validation["compatibility_score"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 