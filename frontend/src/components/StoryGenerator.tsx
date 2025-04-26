import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { generateStory } from '../lib/services/storyService';

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

export function StoryGenerator({ onGenerate }: StoryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [storyParams, setStoryParams] = useState<StoryParams>({
    mainCharacter: '',
    setting: '',
    genre: '',
    tone: '',
    additionalDetails: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    
    try {
      const result = await generateStory(storyParams);
      
      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedStory(result.story);
      }

      if (onGenerate) {
        onGenerate(storyParams);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Story Generator</CardTitle>
          <CardDescription>
            Fill in the details below to generate your unique story
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
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Generating Story...' : 'Generate Story'}
            </Button>
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

      {generatedStory && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generated Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose">
              <p>{generatedStory}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 