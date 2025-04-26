import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class StoryAIAssistant:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Base prompt template for story generation
        self.base_prompt = """
        Create an engaging story based on the following parameters:
        
        Main Character: {main_character}
        Setting: {setting}
        Genre: {genre}
        Tone: {tone}
        Additional Details: {additional_details}

        Please create a well-structured, creative story that incorporates all these elements.
        The story should be engaging, maintain the specified tone, and be appropriate for the genre.
        Focus on character development, vivid descriptions, and a clear narrative arc.
        The story should be between 300-500 words.
        """

    async def generate_story(
        self,
        main_character: str,
        setting: str,
        genre: str,
        tone: str,
        additional_details: Optional[str] = None
    ) -> str:
        # Format the prompt with the provided parameters
        prompt = self.base_prompt.format(
            main_character=main_character,
            setting=setting,
            genre=genre,
            tone=tone,
            additional_details=additional_details or "None provided"
        )

        try:
            # Generate the story using Gemini
            response = self.model.generate_content(prompt)
            
            # Check if the response is valid
            if not response.text:
                raise Exception("Failed to generate a story. Please try again.")
            
            return response.text.strip()
        except Exception as e:
            raise Exception(f"Error generating story: {str(e)}")

    def customize_prompt(self, custom_prompt: str):
        """
        Allows customization of the base prompt template.
        Use this method to update the prompt structure if needed.
        """
        self.base_prompt = custom_prompt 