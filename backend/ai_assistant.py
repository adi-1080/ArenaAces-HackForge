import os
import json
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class PreservedElement(BaseModel):
    type: str
    name: str
    importance: float

class StoryAIAssistant:
    def __init__(self):
        self.stories = {}
        self.setup_genai()
        
    def setup_genai(self):
        genai.configure(api_key="AIzaSyBitpvZKg7l3OPJsE4H3z9boEyo6bGv5kU")
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_alternative_branches(
        self,
        chapter_content: str,
        story_context: str | None,
        preserved_elements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate alternative branches for a given chapter using AI."""
        # Construct the prompt
        prompt = self._construct_generation_prompt(
            chapter_content,
            story_context,
            preserved_elements
        )

        try:
            # Call Gemini API
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("Failed to generate alternatives")
            
            # Parse and format the response
            alternatives = self._parse_generation_response(response.text)
            return alternatives
            
        except Exception as e:
            print(f"Error generating alternatives: {str(e)}")
            raise

    def validate_branch(
        self,
        original_content: str,
        branch_content: str,
        preserved_elements: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Validate a branch against the original content and preserved elements."""
        # Construct the prompt
        prompt = self._construct_validation_prompt(
            original_content,
            branch_content,
            preserved_elements
        )

        try:
            # Call Gemini API
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("Failed to validate branch")
            
            # Parse and format the response
            validation_result = self._parse_validation_response(response.text)
            return validation_result
            
        except Exception as e:
            print(f"Error validating branch: {str(e)}")
            raise

    def _construct_generation_prompt(
        self,
        chapter_content: str,
        story_context: str | None,
        preserved_elements: List[Dict[str, Any]]
    ) -> str:
        """Construct the prompt for generating alternative branches."""
        prompt = f"""Generate 3 alternative versions of the following chapter while preserving specific elements.

Original Chapter:
{chapter_content}

"""
        if story_context:
            prompt += f"""Story Context:
{story_context}

"""

        prompt += f"""Elements to Preserve:
{self._format_preserved_elements(preserved_elements)}

Please generate 3 alternative versions of this chapter. For each alternative:
1. Keep the preserved elements intact
2. Maintain logical consistency
3. Create meaningful differences from the original
4. Provide a summary of changes
5. List key differences from the original

Format your response as a JSON array containing 3 objects, each with:
- content: The alternative chapter text
- summary: A brief summary of the alternative
- key_differences: List of main differences from original
- preserved_elements: List of preserved elements and how they were maintained

Example format:
[
  {
    "content": "Alternative chapter text...",
    "summary": "Brief summary...",
    "key_differences": ["difference 1", "difference 2"],
    "preserved_elements": [{"type": "character", "name": "John", "importance": 0.9}]
  },
  ...
]
"""
        return prompt

    def _construct_validation_prompt(
        self,
        original_content: str,
        branch_content: str,
        preserved_elements: List[Dict[str, Any]]
    ) -> str:
        """Construct the prompt for validating a branch."""
        return f"""Validate the following alternative branch against the original chapter and preserved elements.

Original Chapter:
{original_content}

Alternative Branch:
{branch_content}

Elements that must be preserved:
{self._format_preserved_elements(preserved_elements)}

Please analyze the alternative branch and provide your analysis in JSON format with the following structure:
{{
    "is_valid": boolean,
    "continuity_issues": ["issue1", "issue2", ...],
    "compatibility_score": float between 0 and 1,
    "explanation": "detailed explanation"
}}

Focus on:
1. Whether it's valid (preserves required elements and maintains consistency)
2. List of any continuity issues
3. Compatibility score (0-1) based on how well it preserves elements and maintains consistency
4. Explanation of any issues found
"""

    def _format_preserved_elements(self, elements: List[Dict[str, Any]]) -> str:
        """Format preserved elements for inclusion in the prompt."""
        formatted = []
        for element in elements:
            formatted.append(f"- Type: {element['type']}")
            formatted.append(f"  Name: {element['name']}")
            formatted.append(f"  Importance: {element['importance']}")
        return "\n".join(formatted)

    def _parse_generation_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse the AI response for alternative branches."""
        try:
            # Try to parse the response as JSON
            alternatives = json.loads(response)
            
            # Validate the structure
            if not isinstance(alternatives, list):
                raise ValueError("Response is not a list")
                
            # Ensure we have exactly 3 alternatives
            alternatives = alternatives[:3]
            
            # Validate each alternative has required fields
            for alt in alternatives:
                if not all(key in alt for key in ["content", "summary", "key_differences", "preserved_elements"]):
                    raise ValueError("Alternative missing required fields")
                
                # Ensure preserved_elements is in the correct format
                if not isinstance(alt["preserved_elements"], list):
                    alt["preserved_elements"] = []
                
                # Convert preserved_elements to the correct format if they're not already
                formatted_elements = []
                for pe in alt["preserved_elements"]:
                    if isinstance(pe, str):
                        # If it's a string, assume it's a character name
                        formatted_elements.append({
                            "type": "character",
                            "name": pe,
                            "importance": 1.0
                        })
                    elif isinstance(pe, dict):
                        # If it's already a dict, ensure it has all required fields
                        if not all(key in pe for key in ["type", "name", "importance"]):
                            pe = {
                                "type": pe.get("type", "character"),
                                "name": pe.get("name", "Unknown"),
                                "importance": pe.get("importance", 1.0)
                            }
                        formatted_elements.append(pe)
                
                alt["preserved_elements"] = formatted_elements
            
            return alternatives
            
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract structured data from the text
            alternatives = []
            sections = response.split("Alternative")
            
            for i, section in enumerate(sections[1:4], 1):  # Process up to 3 alternatives
                # Extract content (everything up to "Summary:" or similar)
                content = section.split("Summary:")[0].strip()
                
                # Extract summary (between "Summary:" and "Key Differences:")
                summary = section.split("Summary:")[1].split("Key Differences:")[0].strip() if "Summary:" in section else ""
                
                # Extract key differences
                key_diff_section = section.split("Key Differences:")[1].split("Preserved Elements:")[0].strip() if "Key Differences:" in section else ""
                key_differences = [diff.strip() for diff in key_diff_section.split("-") if diff.strip()]
                
                # Extract preserved elements
                preserved_section = section.split("Preserved Elements:")[1].strip() if "Preserved Elements:" in section else ""
                preserved_elements = []
                for line in preserved_section.split("\n"):
                    if line.strip().startswith(("-", "*")):
                        element = line.strip().lstrip("- *").strip()
                        preserved_elements.append({
                            "type": "character",
                            "name": element,
                            "importance": 1.0
                        })
                
                alternatives.append({
                    "content": content,
                    "summary": summary,
                    "key_differences": key_differences,
                    "preserved_elements": preserved_elements
                })
            
            return alternatives

    def _parse_validation_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response for branch validation."""
        try:
            # Try to parse the response as JSON
            validation = json.loads(response)
            
            # Ensure all required fields are present
            required_fields = ["is_valid", "continuity_issues", "compatibility_score", "explanation"]
            if not all(field in validation for field in required_fields):
                raise ValueError("Response missing required fields")
                
            # Validate data types
            if not isinstance(validation["is_valid"], bool):
                validation["is_valid"] = True  # Default to True if invalid
                
            if not isinstance(validation["continuity_issues"], list):
                validation["continuity_issues"] = []
                
            if not isinstance(validation["compatibility_score"], (int, float)):
                validation["compatibility_score"] = 0.85  # Default score if invalid
            
            # Ensure compatibility score is between 0 and 1
            validation["compatibility_score"] = max(0.0, min(1.0, float(validation["compatibility_score"])))
            
            return validation
            
        except json.JSONDecodeError:
            # If JSON parsing fails, extract information from text
            is_valid = "invalid" not in response.lower() and "not valid" not in response.lower()
            
            # Extract continuity issues (look for bullet points or numbered lists)
            issues = []
            for line in response.split("\n"):
                if line.strip().startswith(("-", "*", "1.", "2.")):
                    issues.append(line.strip().lstrip("- *123456789.").strip())
            
            # Extract or estimate compatibility score
            score = 0.85  # Default score
            score_matches = [float(s) for s in response.split() if s.replace(".", "").isdigit() and 0 <= float(s) <= 1]
            if score_matches:
                score = score_matches[0]
            
            return {
                "is_valid": is_valid,
                "continuity_issues": issues[:3],  # Limit to top 3 issues
                "compatibility_score": score,
                "explanation": response[:200]  # First 200 characters as explanation
            }

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
        if not self.stories.get(story_id, []):
            return "This is the first chapter of the story."
        
        summaries = [f"Chapter {i+1}: {chapter['summary']}" 
                    for i, chapter in enumerate(self.stories[story_id])]
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
        chapter_number = len(self.stories.get(story_id, [])) + 1
        previous_chapters_summary = self._get_previous_chapters_summary(story_id)

        # Format the prompt with the provided parameters
        prompt = f"""
        Create Chapter {chapter_number} of an engaging story based on the following parameters:
        
        Main Character: {main_character}
        Setting: {setting}
        Genre: {genre}
        Tone: {tone}
        Additional Details: {additional_details or "None provided"}

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

        try:
            # Generate the chapter using Gemini
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("Failed to generate the chapter. Please try again.")
            
            chapter_content = response.text.strip()
            chapter_summary = self._generate_chapter_summary(chapter_content)

            # Store chapter in history
            if story_id not in self.stories:
                self.stories[story_id] = []
            
            self.stories[story_id].append({
                'content': chapter_content,
                'summary': chapter_summary
            })

            return {
                'chapter_number': chapter_number,
                'content': chapter_content,
                'total_chapters': len(self.stories[story_id])
            }

        except Exception as e:
            raise Exception(f"Error generating chapter: {str(e)}")

    def get_story_progress(self, story_id: str) -> dict:
        """Get the progress of a story including total chapters and summaries."""
        if story_id not in self.stories:
            return {'total_chapters': 0, 'chapters': []}
        
        return {
            'total_chapters': len(self.stories[story_id]),
            'chapters': [
                {
                    'chapter_number': i + 1,
                    'summary': chapter['summary']
                }
                for i, chapter in enumerate(self.stories[story_id])
            ]
        }

    async def analyze_story(self, story: str) -> dict:
        """Analyze a story using Gemini AI."""
        prompt = f"""
        Analyze this story and provide a detailed critique. Format your response in a structured way with the following sections:

        PLOT SUMMARY:
        [Write a brief summary of the plot]

        STRENGTHS:
        - [List key strengths]
        - [Continue with more strengths]

        AREAS FOR IMPROVEMENT:
        - [List areas that need improvement]
        - [Continue with more areas]

        NARRATIVE STRUCTURE:
        - Introduction: [Analysis]
        - Rising Action: [Analysis]
        - Climax: [Analysis]
        - Resolution: [Analysis]

        ALTERNATIVE SUGGESTIONS:
        1. [First alternative title]: [Description]
        2. [Second alternative title]: [Description]
        3. [Third alternative title]: [Description]

        Story to analyze:
        {story}
        """

        try:
            response = self.model.generate_content(prompt)
            if not response.text:
                raise Exception("Failed to analyze story")
            
            text = response.text.strip()
            
            try:
                # First try to parse as JSON if the response happens to be in JSON format
                analysis = json.loads(text)
                return analysis
            except json.JSONDecodeError:
                # If not JSON, parse the structured text response
                analysis = {}
                
                # Extract plot summary
                if "PLOT SUMMARY:" in text:
                    summary_section = text.split("PLOT SUMMARY:")[1].split("STRENGTHS:")[0].strip()
                    analysis["plot_summary"] = summary_section
                else:
                    analysis["plot_summary"] = "Plot summary not provided"
                
                # Extract strengths
                strengths = []
                if "STRENGTHS:" in text:
                    strengths_section = text.split("STRENGTHS:")[1].split("AREAS FOR IMPROVEMENT:")[0]
                    strengths = [s.strip().lstrip("- ") for s in strengths_section.split("\n") if s.strip().startswith("-")]
                analysis["strengths"] = strengths if strengths else ["No strengths identified"]
                
                # Extract areas for improvement
                improvements = []
                if "AREAS FOR IMPROVEMENT:" in text:
                    improvements_section = text.split("AREAS FOR IMPROVEMENT:")[1].split("NARRATIVE STRUCTURE:")[0]
                    improvements = [i.strip().lstrip("- ") for i in improvements_section.split("\n") if i.strip().startswith("-")]
                analysis["areas_for_improvement"] = improvements if improvements else ["No improvements suggested"]
                
                # Extract narrative structure
                structure = {}
                if "NARRATIVE STRUCTURE:" in text:
                    structure_section = text.split("NARRATIVE STRUCTURE:")[1].split("ALTERNATIVE SUGGESTIONS:")[0]
                    structure_items = [s.strip().lstrip("- ") for s in structure_section.split("\n") if s.strip().startswith("-")]
                    for item in structure_items:
                        if ":" in item:
                            key, value = item.split(":", 1)
                            structure[key.strip()] = value.strip()
                analysis["narrative_structure"] = structure if structure else {"overall": "Structure analysis not provided"}
                
                # Extract alternatives
                alternatives = {}
                if "ALTERNATIVE SUGGESTIONS:" in text:
                    alt_section = text.split("ALTERNATIVE SUGGESTIONS:")[1]
                    alt_items = [a.strip().lstrip("123. ") for a in alt_section.split("\n") if a.strip() and any(c.isdigit() for c in a)]
                    for i, item in enumerate(alt_items, 1):
                        if ":" in item:
                            title, desc = item.split(":", 1)
                            alternatives[f"Alternative {chr(64+i)}"] = desc.strip()
                analysis["alternatives"] = alternatives if alternatives else {"Alternative A": "No alternatives suggested"}
                
                return analysis
                
        except Exception as e:
            print(f"Error in analyze_story: {str(e)}")
            # Return a structured response even in case of error
            return {
                "plot_summary": "Unable to analyze the story at this time. Please try again.",
                "strengths": ["Analysis unavailable"],
                "areas_for_improvement": ["Analysis unavailable"],
                "narrative_structure": {"overall": "Analysis unavailable"},
                "alternatives": {"Alternative A": "Analysis unavailable"}
            }