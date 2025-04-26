
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const collaborators = [
  { id: 1, name: "Jane Cooper", role: "Editor", avatar: "JC" },
  { id: 2, name: "Alex Morgan", role: "Co-Writer", avatar: "AM" },
  { id: 3, name: "Michael Stevens", role: "Beta Reader", avatar: "MS" },
];

const Collaboration = () => {
  const { toast } = useToast();
  
  const handleInvite = () => {
    toast({
      title: "Invitation Sent",
      description: "Your invitation has been sent successfully.",
    });
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-story-purple mr-2" />
        <h1 className="text-3xl font-serif font-bold">Collaboration</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Collaborators</CardTitle>
              <CardDescription>
                People currently working with you on your stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collaborators.map((person) => (
                  <div key={person.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-story-purple text-white">
                          {person.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">{person.role}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Recent activity on your collaborative projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/40 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs bg-story-blue text-primary-foreground">AM</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">Alex Morgan</p>
                    <p className="text-xs text-muted-foreground ml-2">2 hours ago</p>
                  </div>
                  <p className="text-sm">Added a new chapter to "Beyond the Stars"</p>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs bg-story-blue text-primary-foreground">JC</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">Jane Cooper</p>
                    <p className="text-xs text-muted-foreground ml-2">Yesterday</p>
                  </div>
                  <p className="text-sm">Left 5 comments on "The Last Adventure"</p>
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs bg-story-blue text-primary-foreground">MS</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">Michael Stevens</p>
                    <p className="text-xs text-muted-foreground ml-2">3 days ago</p>
                  </div>
                  <p className="text-sm">Completed review of "Whispers in the Dark"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invite Collaborators</CardTitle>
              <CardDescription>
                Add new team members to your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="collaborator@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="e.g. Editor, Co-Writer, Beta Reader" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input id="project" placeholder="Select a project" />
                </div>
                
                <Button 
                  className="w-full bg-story-purple hover:bg-story-purple/90"
                  onClick={handleInvite}
                  type="button"
                >
                  Send Invitation
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Collaboration Settings</CardTitle>
              <CardDescription>
                Manage your collaboration preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Notification Settings
              </Button>
              
              <Button variant="outline" className="w-full">
                Access Controls
              </Button>
              
              <Button variant="outline" className="w-full">
                Feedback Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
