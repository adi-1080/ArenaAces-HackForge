export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  parentId?: string;
}

export interface PreservedElement {
  type: 'character' | 'event';
  name: string;
  importance: number;
}

export interface Branch {
  id: string;
  chapterId: string;
  summary: string;
  keyDifferences: string[];
  continuityIssues: string[];
  compatibilityScore: number;
  preservedElements: PreservedElement[];
}

export interface BranchingVisualizerProps {
  storyId: string;
  chapters: Chapter[];
  onBranchSelect?: (branch: Branch) => void;
} 