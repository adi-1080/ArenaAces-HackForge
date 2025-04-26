import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { generateStory, getStoryProgress } from '../lib/services/storyService';
import BranchingVisualizer from './BranchingVisualizer';
import { Chapter } from '../types/branching';

interface StoryGeneratorProps {
  onGenerate?: (storyParams: StoryParams) => void;
}

interface StoryParams {
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

export function StoryGenerator({ onGenerate }: StoryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [storyId, setStoryId] = useState<string>('');
  const [chapterNumber, setChapterNumber] = useState<number>(0);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [previousChapters, setPreviousChapters] = useState<ChapterInfo[]>([]);
  const [storyParams, setStoryParams] = useState<StoryParams>({
    mainCharacter: '',
    setting: '',
    genre: '',
    tone: '',
    additionalDetails: '',
  });
  const [isFormLocked, setIsFormLocked] = useState(false);

  // Transform ChapterInfo to Chapter type for BranchingVisualizer
  const transformedChapters: Chapter[] = [...previousChapters, currentChapter ? {
    id: chapterNumber.toString(),
    title: `Chapter ${chapterNumber}`,
    content: currentChapter,
    order: chapterNumber,
    parentId: (chapterNumber > 1) ? (chapterNumber - 1).toString() : undefined
  } : []].filter(chapter => chapter !== null).map((chapter, index) => ({
    id: (index + 1).toString(),
    title: `Chapter ${index + 1}`,
    content: typeof chapter === 'string' ? chapter : 
            'chapter_number' in chapter ? chapter.summary :
            chapter.content,
    order: index + 1,
    parentId: index > 0 ? index.toString() : undefined
  }));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadStoryProgress = async (id: string) => {
    try {
      const progress = await getStoryProgress(id);
      setPreviousChapters(progress.chapters);
      setTotalChapters(progress.total_chapters);
    } catch (error) {
      console.error('Error loading story progress:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateStory({
        ...storyParams,
        story_id: storyId || undefined
      });
      
      setStoryId(result.story_id);
      setCurrentChapter(result.content);
      setChapterNumber(result.chapter_number);
      setTotalChapters(result.total_chapters);
      setIsFormLocked(true);

      await loadStoryProgress(result.story_id);

      if (onGenerate) {
        onGenerate(storyParams);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNextChapter = async () => {
    if (!storyId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateStory({
        ...storyParams,
        story_id: storyId
      });
      
      setCurrentChapter(result.content);
      setChapterNumber(result.chapter_number);
      setTotalChapters(result.total_chapters);
      await loadStoryProgress(storyId);
    } catch (error) {
      console.error('Error generating next chapter:', error);
      setError('Failed to generate next chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewStory = () => {
    setStoryId('');
    setCurrentChapter('');
    setChapterNumber(0);
    setTotalChapters(0);
    setPreviousChapters([]);
    setIsFormLocked(false);
    setStoryParams({
      mainCharacter: '',
      setting: '',
      genre: '',
      tone: '',
      additionalDetails: '',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Story Generator</CardTitle>
          <CardDescription>
            Fill in the details below to generate your story chapter by chapter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mainCharacter">Main Character</Label>
              <Input
                id="mainCharacter"
                name="mainCharacter"
                placeholder="Describe your main character"
                value={storyParams.mainCharacter}
                onChange={handleInputChange}
                required
                disabled={isFormLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting">Setting</Label>
              <Input
                id="setting"
                name="setting"
                placeholder="Where does your story take place?"
                value={storyParams.setting}
                onChange={handleInputChange}
                required
                disabled={isFormLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                name="genre"
                placeholder="What's the genre of your story? (e.g., Fantasy, Mystery, Romance)"
                value={storyParams.genre}
                onChange={handleInputChange}
                required
                disabled={isFormLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                name="tone"
                placeholder="What's the tone of your story? (e.g., Humorous, Dark, Inspirational)"
                value={storyParams.tone}
                onChange={handleInputChange}
                required
                disabled={isFormLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details</Label>
              <Textarea
                id="additionalDetails"
                name="additionalDetails"
                placeholder="Any additional details or specific elements you'd like to include?"
                value={storyParams.additionalDetails}
                onChange={handleInputChange}
                rows={4}
                disabled={isFormLocked}
              />
            </div>

            {!isFormLocked ? (
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Generating Chapter...' : 'Start Story'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleGenerateNextChapter}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Chapter...' : 'Generate Next Chapter'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleStartNewStory}
                  disabled={isLoading}
                >
                  Start New Story
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full max-w-2xl mx-auto bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {previousChapters.length > 0 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Previous Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousChapters.map((chapter) => (
                <div key={chapter.chapter_number} className="border-b pb-4">
                  <h3 className="font-semibold">Chapter {chapter.chapter_number}</h3>
                  <p className="text-sm text-gray-600">{chapter.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentChapter && (
        <>
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Chapter {chapterNumber}</CardTitle>
              <CardDescription>
                {totalChapters > 1 ? `Part ${chapterNumber} of your story` : 'The beginning of your story'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose">
                <p>{currentChapter}</p>
              </div>
            </CardContent>
          </Card>

          {/* Add BranchingVisualizer after the current chapter */}
          <Card className="w-full mx-auto mt-8">
            <CardHeader>
              <CardTitle>Story Branches</CardTitle>
              <CardDescription>
                Explore alternative story paths and branches
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {storyId && transformedChapters.length > 0 && (
                <BranchingVisualizer
                  storyId={storyId}
                  chapters={transformedChapters}
                  onBranchSelect={(branch) => {
                    console.log('Selected branch:', branch);
                    // TODO: Implement branch selection handling
                  }}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 