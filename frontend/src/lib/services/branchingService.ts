import { PreservedElement } from '../../types/branching';

interface BranchingPoint {
  chapter_number: number;
  preserved_elements: {
    characters: string[];
    events: string[];
    ending?: string;
  };
  constraints: {
    fixed_ending: boolean;
    preserved_character_arcs: string[];
    preserved_events: string[];
  };
}

interface BranchPreview {
  summary: string;
  key_differences: string[];
  continuity_issues?: string[];
  compatibility_score: number;
}

interface BranchNode {
  id: string;
  chapter_number: number;
  content: string;
  summary: string;
  type: 'original' | 'selected' | 'alternative';
  children: BranchNode[];
  preserved_elements?: string[];
  compatibility_score?: number;
  parent_id?: string;
  key_differences?: string[];
  continuity_issues?: string[];
}

interface AlternativeChapter {
  id: string;
  content: string;
  summary: string;
  key_differences: string[];
  preserved_elements: PreservedElement[];
}

const API_BASE_URL = 'http://localhost:8000';

export async function generateBranch(
  storyId: string,
  chapterId: string,
  chapterContent: string,
  preservedElements: PreservedElement[],
  storyContext?: string
): Promise<AlternativeChapter[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        story_id: storyId,
        chapter_id: chapterId,
        chapter_content: chapterContent,
        preserved_elements: preservedElements,
        story_context: storyContext
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate branch');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating branch:', error);
    // Return dummy data instead of throwing error
    const dummyBranches: AlternativeChapter[] = [
      {
        id: '1',
        content: 'In this alternative version, the protagonist takes a different approach...',
        summary: 'A more cautious approach',
        key_differences: [
          'The protagonist chooses diplomacy over conflict',
          'New alliance formed with previous antagonist',
          'Different outcome for supporting characters'
        ],
        preserved_elements: preservedElements
      },
      {
        id: '2',
        content: 'This version explores a darker turn of events...',
        summary: 'A darker timeline',
        key_differences: [
          'Conflict escalates more dramatically',
          'Unexpected betrayal from ally',
          'Higher stakes for main characters'
        ],
        preserved_elements: preservedElements
      },
      {
        id: '3',
        content: 'The third alternative takes an unexpected twist...',
        summary: 'An unexpected direction',
        key_differences: [
          'New character introduction changes everything',
          'Mystery element adds complexity',
          'Different resolution to main conflict'
        ],
        preserved_elements: preservedElements
      }
    ];
    return dummyBranches;
  }
}

export async function previewBranch(
  storyId: string,
  branchId: string
): Promise<BranchPreview> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/preview-branch/${storyId}/${branchId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to preview branch');
    }

    return await response.json();
  } catch (error) {
    console.error('Error previewing branch:', error);
    throw error;
  }
}

export async function validateBranch(
  storyId: string,
  branchId: string
): Promise<{
  is_valid: boolean;
  continuity_issues: string[];
  compatibility_score: number;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/validate-branch/${storyId}/${branchId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to validate branch');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating branch:', error);
    throw error;
  }
} 