interface StoryParams {
  mainCharacter: string;
  setting: string;
  genre: string;
  tone: string;
  additionalDetails: string;
}

interface StoryResponse {
  story: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:8000';

export async function generateStory(params: StoryParams): Promise<StoryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate story');
    }

    const data = await response.json();
    return { story: data.story };
  } catch (error) {
    console.error('Error generating story:', error);
    return { 
      story: '',
      error: error instanceof Error ? error.message : 'Failed to generate story'
    };
  }
} 