import { useState } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { analyzePlot } from '../lib/services/plotAnalysisService';
import { Loader2 } from 'lucide-react';

interface AnalysisResult {
  plot_summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  narrative_structure: Record<string, string>;
  alternatives: Record<string, string>;
}

export function PlotAnalysis() {
  const [story, setStory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!story.trim()) {
      setError('Please enter your story text');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzePlot(story);
      setAnalysis(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze plot');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Plot Analysis</CardTitle>
          <CardDescription>
            Paste your story text below for a detailed plot analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your story text here..."
              className="min-h-[200px]"
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Plot'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full max-w-4xl mx-auto bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Plot Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.plot_summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-green-700">{strength}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {analysis.areas_for_improvement.map((area, index) => (
                    <li key={index} className="text-amber-700">{area}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Narrative Structure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis.narrative_structure).map(([section, analysis], index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900">{section}</h3>
                    <p className="text-gray-700 mt-1">{analysis}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Alternative Plot Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis.alternatives).map(([title, description], index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold text-blue-600">{title}</h3>
                    <p className="text-gray-700 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 