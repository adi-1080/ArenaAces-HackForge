const API_BASE_URL = 'http://localhost:8000';

export async function convertSpeechToText(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.m4a');

    const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to convert speech to text');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
  }
}

export async function submitSpeechStory(
  audioBlob: Blob,
  storyId?: string,
  genre?: string,
  tone?: string
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.m4a');
    if (storyId) formData.append('story_id', storyId);
    if (genre) formData.append('genre', genre);
    if (tone) formData.append('tone', tone);

    const response = await fetch(`${API_BASE_URL}/api/speech-story-input`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process speech story');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting speech story:', error);
    throw error;
  }
} 