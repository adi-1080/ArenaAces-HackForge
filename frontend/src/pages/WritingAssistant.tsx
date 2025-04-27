import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pen, MessageSquare, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VoiceRecorder } from "@/components/VoiceRecorder";

interface Message {
  id: number;
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WritingAssistant = () => {
  const { toast } = useToast();
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [writingContent, setWritingContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      content: "Welcome to the Writing Assistant! How can I help with your writing today?",
      timestamp: new Date(),
    },
  ]);
  
  const handleTranscription = (text: string) => {
    const currentContent = writingContent;
    const newContent = currentContent ? `${currentContent}\n${text}` : text;
    setWritingContent(newContent);
    toast({
      title: "Voice Transcribed",
      description: "Your voice has been converted to text and added to the writing area.",
    });
  };
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: userInput,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    setUserInput("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can suggest more vivid descriptors for the setting. Try incorporating sensory details like the scent of pine needles or the distant sound of rushing water to make the forest feel more immersive.",
        "The dialogue here feels a bit stilted. Consider how people actually speak—with interruptions, fragments, and unique speech patterns. What if your character trails off mid-sentence or has a specific verbal tic?",
        "This character's motivation isn't coming through clearly. Consider adding a brief moment showing why this journey matters so deeply to them. Perhaps a flashback or a meaningful object they keep checking?",
        "The pacing here feels rushed. You might want to slow down this revelation and build more tension before the big discovery. Sometimes what's unsaid creates more impact than what's explicitly stated.",
        "I notice a theme of isolation developing. You could strengthen this by contrasting the character's solitude with brief glimpses of connection, making the loneliness more poignant.",
      ];
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        sender: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Pen className="h-6 w-6 text-story-purple mr-2" />
        <h1 className="text-3xl font-serif font-bold">Writing Assistant</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="border-story-blue/30 h-[calc(100vh-230px)] flex flex-col">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center">
                <Pen className="h-4 w-4 text-story-purple mr-2" />
                <h2 className="font-medium">Writing Area</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-story-blue/10">
                  Draft
                </Badge>
                <VoiceRecorder onTranscription={handleTranscription} />
              </div>
            </div>
            
            <CardContent className="flex-1 p-0 relative">
              <Textarea
                placeholder="Start writing your story here..."
                className="h-full border-0 rounded-none resize-none p-4 font-serif text-lg"
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-[calc(100vh-230px)] flex flex-col">
            <div className="p-4 border-b bg-muted/30 flex items-center">
              <MessageSquare className="h-4 w-4 text-story-purple mr-2" />
              <h2 className="font-medium">Assistant</h2>
            </div>
            
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-story-purple text-white' 
                            : 'bg-muted border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'assistant' && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-story-blue text-primary-foreground">SC</AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'user' ? 'You' : 'Assistant'}
                          </span>
                        </div>
                        <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-foreground'}`}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted border">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-story-blue text-primary-foreground">SC</AvatarFallback>
                          </Avatar>
                          <span className="text-xs opacity-75">
                            Assistant
                          </span>
                        </div>
                        <div className="flex gap-1 items-center h-4">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Ask for writing suggestions..."
                    className="resize-none"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!userInput.trim() || isTyping}
                    className="bg-story-purple hover:bg-story-purple/90 h-full"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;
