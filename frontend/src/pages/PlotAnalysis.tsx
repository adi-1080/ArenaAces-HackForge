
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PlotAnalysis = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manuscript, setManuscript] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  
  const handleAnalyze = () => {
    if (!manuscript) {
      toast({
        title: "Missing Content",
        description: "Please enter your manuscript content for analysis.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate API call for plot analysis
    setTimeout(() => {
      const mockAnalysis = {
        summary: "The story follows a protagonist discovering a hidden world beneath their city, leading to adventures and moral dilemmas as they navigate between two realities.",
        strengths: [
          "Strong character motivations",
          "Unique premise with good worldbuilding",
          "Clear thematic exploration of belonging and identity"
        ],
        weaknesses: [
          "Pacing issues in the middle sections",
          "Some character relationships need more development",
          "The climactic scene could have higher stakes"
        ],
        suggestions: [
          {
            title: "Alternative A: Hidden Ally",
            description: "Consider revealing that one of the antagonists is actually working to help the protagonist from within, creating a surprising twist and new alliance midway through the story."
          },
          {
            title: "Alternative B: Raising Stakes",
            description: "The threat to the underground world could extend to the surface world as well, raising the stakes and giving more urgency to the protagonist's mission."
          },
          {
            title: "Alternative C: Deeper Character Arc",
            description: "The protagonist's initial goals could be selfish, with their character arc involving learning to fight for others rather than personal gain."
          }
        ],
        structureMap: [
          "Introduction and ordinary world (1-3): Well established",
          "Inciting incident (4): Clear and compelling",
          "First plot point (10): Strong transition",
          "Rising action (11-25): Pacing issues here",
          "Midpoint (26): Lacks sufficient impact",
          "Complications (27-40): Good tension building",
          "Second plot point (41): Effective revelation",
          "Climax build-up (42-45): Could use higher stakes",
          "Climax (46-48): Emotionally resonant but could be stronger",
          "Resolution (49-50): Satisfying conclusion"
        ]
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your manuscript has been analyzed successfully!",
      });
    }, 3000);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <BookOpen className="h-6 w-6 text-story-purple mr-2" />
        <h1 className="text-3xl font-serif font-bold">Plot Analysis</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="manuscript">Enter your manuscript or plot summary</Label>
            <Textarea
              id="manuscript"
              placeholder="Paste your manuscript text or enter a detailed plot summary here..."
              className="min-h-[200px] font-serif leading-relaxed"
              value={manuscript}
              onChange={(e) => setManuscript(e.target.value)}
            />
            <Button 
              className="mt-4 bg-story-purple hover:bg-story-purple/90"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Plot"}
            </Button>
          </CardContent>
        </Card>
        
        {analysis && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Analysis Results</h2>
            
            <Tabs defaultValue="summary" className="w-full">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-4 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-3">Plot Summary</h3>
                    <p className="text-muted-foreground mb-6">{analysis.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="text-muted-foreground">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-600 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysis.weaknesses.map((weakness: string, index: number) => (
                            <li key={index} className="text-muted-foreground">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="structure" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-4">Narrative Structure</h3>
                    <div className="space-y-3">
                      {analysis.structureMap.map((item: string, index: number) => {
                        const [section, assessment] = item.split(": ");
                        const match = section.match(/\((\d+)(-\d+)?\)/);
                        const chapterInfo = match ? match[0] : "";
                        const sectionName = section.replace(chapterInfo, "").trim();
                        
                        // Determine color based on assessment
                        let color = "bg-green-100 border-green-200";
                        if (assessment.includes("issue") || assessment.includes("Lack")) {
                          color = "bg-amber-50 border-amber-200";
                        }
                        
                        return (
                          <div 
                            key={index} 
                            className={`p-3 border rounded-md ${color} flex items-center`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium">{sectionName}</span>
                                <span className="text-xs text-muted-foreground ml-2">{chapterInfo}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{assessment}</p>
                            </div>
                            {index < analysis.structureMap.length - 1 && (
                              <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="alternatives" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.suggestions.map((suggestion: any, index: number) => (
                    <Card key={index} className="border-story-blue/30 h-full">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-2">{suggestion.title}</h3>
                        <p className="text-muted-foreground text-sm">{suggestion.description}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Expand on this idea
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotAnalysis;
