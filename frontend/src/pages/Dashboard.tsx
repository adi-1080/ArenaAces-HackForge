
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, BookText, Pen, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const recentProjects = [
  { id: 1, title: "The Last Adventure", type: "Novel", lastEdited: "2 hours ago" },
  { id: 2, title: "Beyond the Stars", type: "Short Story", lastEdited: "Yesterday" },
  { id: 3, title: "Whispers in the Dark", type: "Novel", lastEdited: "3 days ago" },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Continue your writing journey</p>
        </div>
        <Button className="bg-story-purple hover:bg-story-purple/90">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/generate">
          <Card className="h-full hover:border-story-purple/50 transition-colors cursor-pointer shadow-soft">
            <CardHeader>
              <BookText className="h-8 w-8 text-story-purple mb-2" />
              <CardTitle>Story Generator</CardTitle>
              <CardDescription>Create new stories with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Generate complete narratives based on your parameters, themes, and desired tone.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/plot-analysis">
          <Card className="h-full hover:border-story-purple/50 transition-colors cursor-pointer shadow-soft">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-story-purple mb-2" />
              <CardTitle>Plot Analysis</CardTitle>
              <CardDescription>Analyze and enhance your storylines</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Visualize narrative branches, identify plot holes, and explore alternative story arcs.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/writing">
          <Card className="h-full hover:border-story-purple/50 transition-colors cursor-pointer shadow-soft">
            <CardHeader>
              <Pen className="h-8 w-8 text-story-purple mb-2" />
              <CardTitle>Writing Assistant</CardTitle>
              <CardDescription>Get real-time feedback and suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Write with AI assistance that understands your style, characters, and narrative context.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold mb-4">Recent Projects</h2>
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Last Edited</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr key={project.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="py-3 px-4 font-medium">{project.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{project.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{project.lastEdited}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
