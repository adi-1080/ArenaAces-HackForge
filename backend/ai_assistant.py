import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional, Dict

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class StoryAIAssistant:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.story_history: Dict[str, list] = {}  # Store story history by story_id
        
        # Base prompt template for story generation
        self.base_prompt = """
        Create Chapter {chapter_number} of an engaging story based on the following parameters:
        
        Main Character: {main_character}
        Setting: {setting}
        Genre: {genre}
        Tone: {tone}
        Additional Details: {additional_details}

        Previous Chapters Summary: {previous_chapters_summary}

        Instructions for chapter generation:
        1. Create a well-structured chapter that continues the story naturally from the previous chapters (if any).
        2. Each chapter should be engaging, maintain the specified tone, and be appropriate for the genre.
        3. Focus on character development, vivid descriptions, and advancing the plot.
        4. The chapter should be between 300-500 words.
        5. End the chapter with a hook that leads to the next chapter.
        6. Start with "Chapter {chapter_number}:" followed by a chapter title you create.

        Remember the events and character development from previous chapters to maintain story continuity.
        """

    def _generate_chapter_summary(self, chapter_content: str) -> str:
        summary_prompt = f"""
        Please provide a brief summary of the key events and developments in this chapter:

        {chapter_content}

        Generate a concise summary focusing on:
        1. Main events
        2. Character developments
        3. Important plot points
        Keep the summary under 100 words.
        """
        try:
            response = self.model.generate_content(summary_prompt)
            return response.text.strip()
        except Exception:
            return "Summary generation failed. Using chapter as is."

    def _get_previous_chapters_summary(self, story_id: str) -> str:
        if not self.story_history.get(story_id, []):
            return "This is the first chapter of the story."
        
        summaries = [f"Chapter {i+1}: {chapter['summary']}" 
                    for i, chapter in enumerate(self.story_history[story_id])]
        return "\n".join(summaries)

    async def generate_story(
        self,
        story_id: str,
        main_character: str,
        setting: str,
        genre: str,
        tone: str,
        additional_details: Optional[str] = None,
    ) -> dict:
        chapter_number = len(self.story_history.get(story_id, [])) + 1
        previous_chapters_summary = self._get_previous_chapters_summary(story_id)

        # Format the prompt with the provided parameters
        prompt = self.base_prompt.format(
            chapter_number=chapter_number,
            main_character=main_character,
            setting=setting,
            genre=genre,
            tone=tone,
            additional_details=additional_details or "None provided",
            previous_chapters_summary=previous_chapters_summary
        )

        try:
            # Generate the chapter using Gemini
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("Failed to generate the chapter. Please try again.")
            
            chapter_content = response.text.strip()
            chapter_summary = self._generate_chapter_summary(chapter_content)

            # Store chapter in history
            if story_id not in self.story_history:
                self.story_history[story_id] = []
            
            self.story_history[story_id].append({
                'content': chapter_content,
                'summary': chapter_summary
            })

            return {
                'chapter_number': chapter_number,
                'content': chapter_content,
                'total_chapters': len(self.story_history[story_id])
            }

        except Exception as e:
            raise Exception(f"Error generating chapter: {str(e)}")

    def get_story_progress(self, story_id: str) -> dict:
        """Get the progress of a story including total chapters and summaries."""
        if story_id not in self.story_history:
            return {'total_chapters': 0, 'chapters': []}
        
        return {
            'total_chapters': len(self.story_history[story_id]),
            'chapters': [
                {
                    'chapter_number': i + 1,
                    'summary': chapter['summary']
                }
                for i, chapter in enumerate(self.story_history[story_id])
            ]
        }

    def customize_prompt(self, custom_prompt: str):
        """
        Allows customization of the base prompt template.
        Use this method to update the prompt structure if needed.
        """
        self.base_prompt = custom_prompt 