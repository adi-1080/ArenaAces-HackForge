
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BookOpen, BookText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StoryGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  
  // Form states
  const [genre, setGenre] = useState("");
  const [title, setTitle] = useState("");
  const [premise, setPremise] = useState("");
  const [characters, setCharacters] = useState("");
  const [length, setLength] = useState([1500]);
  
  const handleGenerate = () => {
    if (!premise || !genre) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a premise and genre for your story.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call to generate story
    setTimeout(() => {
      const mockStory = `
# ${title || "The Forgotten Path"}

## A ${genre} story

The morning sun crept through the ancient trees, casting dappled shadows on the forest floor. ${characters || "Alex"} walked cautiously, aware that each step might be leading further away from safety rather than towards it.

"We shouldn't be here," whispered ${characters ? characters.split(",")[1] || characters : "Jordan"}, glancing nervously over their shoulder.

"Just a little further," ${characters || "Alex"} replied, though uncertainty colored their voice.

The forest had stories to tell, legends that the locals whispered about when the nights grew long and the wind howled through the valley. Tales of travelers who ventured into these woods and returned changed—if they returned at all.

But ${characters || "Alex"} needed answers, and this forgotten path was the only way to find them.

The discovery they would soon make would change everything they thought they knew about their world and themselves. The ancient secret hidden among these trees was about to be revealed, for better or worse.

And nothing would ever be the same again.
      `;
      
      setGeneratedStory(mockStory);
      setIsGenerating(false);
      
      toast({
        title: "Story Generated",
        description: "Your story has been created successfully!",
      });
    }, 3000);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <BookText className="h-6 w-6 text-story-purple mr-2" />
        <h1 className="text-3xl font-serif font-bold">Story Generator</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-4">
                <div>
                  <Label htmlFor="title">Story Title (Optional)</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter a title for your story" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="science-fiction">Science Fiction</SelectItem>
                      <SelectItem value="mystery">Mystery</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="historical">Historical Fiction</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="premise">Story Premise</Label>
                  <Textarea
                    id="premise"
                    placeholder="Describe your story idea or premise..."
                    className="min-h-[100px]"
                    value={premise}
                    onChange={(e) => setPremise(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="characters">Main Characters (Optional)</Label>
                  <Input 
                    id="characters" 
                    placeholder="Enter character names, separated by commas" 
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="length">Story Length (words)</Label>
                  <div className="pt-2 pb-6">
                    <Slider
                      id="length"
                      defaultValue={length}
                      max={5000}
                      min={500}
                      step={100}
                      onValueChange={setLength}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {length[0]} words
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  className="w-full bg-story-purple hover:bg-story-purple/90"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                >
                  {isGenerating ? "Generating..." : "Generate Story"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="border-story-blue/30">
            <CardContent className="pt-6">
              {!generatedStory && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mb-4 text-story-blue/50" />
                  <h3 className="text-xl font-medium mb-2">Your story will appear here</h3>
                  <p>Fill out the form and click "Generate Story" to create your narrative</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="animate-pulse">
                    <BookText className="h-16 w-16 mb-4 text-story-purple/60" />
                    <h3 className="text-xl font-medium mb-2">Creating your story...</h3>
                    <p className="text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              ) : (
                <div className="writing-area whitespace-pre-wrap">
                  {generatedStory.split("\n").map((line, index) => {
                    if (line.startsWith("# ")) {
                      return <h1 key={index} className="text-3xl font-bold font-serif mb-4">{line.replace("# ", "")}</h1>;
                    } else if (line.startsWith("## ")) {
                      return <h2 key={index} className="text-xl text-muted-foreground mb-6">{line.replace("## ", "")}</h2>;
                    } else if (line.trim() === "") {
                      return <div key={index} className="h-4"></div>;
                    } else {
                      return <p key={index}>{line}</p>;
                    }
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
