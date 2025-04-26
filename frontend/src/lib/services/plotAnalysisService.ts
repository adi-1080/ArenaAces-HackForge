interface PlotAnalysisRequest {
  story: string;
}

interface PlotAnalysisResponse {
  plot_summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  narrative_structure: Record<string, string>;
  alternatives: Record<string, string>;
}

const API_BASE_URL = 'http://localhost:8000';

export async function analyzePlot(story: string): Promise<PlotAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/plot-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to analyze plot');
    }

    return data;
  } catch (error) {
    console.error('Error analyzing plot:', error);
    throw error;
  }
} 