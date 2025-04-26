interface StoryParams {
  story_id?: string;
  mainCharacter: string;
  setting: string;
  genre: string;
  tone: string;
  additionalDetails: string;
}

interface ChapterInfo {
  chapter_number: number;
  summary: string;
}

interface StoryProgress {
  total_chapters: number;
  chapters: ChapterInfo[];
}

interface StoryResponse {
  story_id: string;
  chapter_number: number;
  content: string;
  total_chapters: number;
  error?: string;
}

const API_BASE_URL = 'http://localhost:8000';

// Helper function to check if the API is available
async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('API not available:', error);
    return false;
  }
}

export async function generateStory(params: StoryParams): Promise<StoryResponse> {
  try {
    // Check if API is available
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      throw new Error('Story Generator API is not available. Please make sure the backend server is running.');
    }

    const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to generate story');
    }

    return data;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

export async function getStoryProgress(storyId: string): Promise<StoryProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/story-progress/${storyId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch story progress');
    }

    return data;
  } catch (error) {
    console.error('Error fetching story progress:', error);
    throw error;
  }
} 