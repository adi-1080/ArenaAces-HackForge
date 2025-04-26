import React, { useState, useCallback, useMemo, useRef } from 'react';
import Tree from 'react-d3-tree';
import { Chapter, Branch, PreservedElement, BranchingVisualizerProps } from '../types/branching';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { generateBranch, previewBranch, validateBranch } from '../lib/services/branchingService';
import { Loader2, GitBranch, AlertCircle, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BranchingVisualizer: React.FC<BranchingVisualizerProps> = ({
  storyId,
  chapters,
  onBranchSelect
}) => {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [preservedCharacters, setPreservedCharacters] = useState<string>('');
  const [preservedEvents, setPreservedEvents] = useState<string>('');
  const [preserveOriginalEnding, setPreserveOriginalEnding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchPreview, setBranchPreview] = useState<any | null>(null);
  const treeContainer = useRef<HTMLDivElement>(null);

  // Transform chapters into tree data structure
  const treeData = useMemo(() => {
    const buildTree = (parentId?: string): any[] => {
      const children = chapters
        .filter(chapter => chapter.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(chapter => ({
          name: chapter.title,
          id: chapter.id,
          children: buildTree(chapter.id),
          attributes: {
            content: chapter.content.substring(0, 50) + '...',
          },
        }));
      return children;
    };

    return buildTree(undefined);
  }, [chapters]);

  // Custom node component
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => (
    <g onClick={() => {
      toggleNode();
      setSelectedChapter(nodeDatum.id);
      toast({
        title: "Chapter Selected",
        description: `Selected chapter: ${nodeDatum.name}`,
      });
    }}>
      <circle r={15} fill={nodeDatum.id === selectedChapter ? '#4CAF50' : '#1976D2'} />
      <text fill="white" x={20} y={5} style={{ fontSize: '12px' }}>
        {nodeDatum.name}
      </text>
    </g>
  );

  // Handle branch generation
  const handleGenerateBranches = async () => {
    if (!selectedChapter) {
      toast({
        title: "Error",
        description: "Please select a chapter first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Generating branches for chapter:", selectedChapter);
      const selectedChapterData = chapters.find(c => c.id === selectedChapter);
      if (!selectedChapterData) {
        throw new Error('Selected chapter not found');
      }

      console.log("Selected chapter data:", selectedChapterData);

      // Get preserved elements from inputs
      const characters = preservedCharacters.split(',').filter(char => char.trim());
      const events = preservedEvents.split(',').filter(event => event.trim());
      
      console.log("Preserved elements:", { characters, events });

      // Get story context from previous chapters
      const previousChapters = chapters
        .filter(c => c.order < selectedChapterData.order)
        .map(c => c.content)
        .join('\n\n');

      console.log("Making API call to generate branches...");
      const alternatives = await generateBranch(
        storyId,
        selectedChapter,
        selectedChapterData.content,
        // Transform preserved elements into the correct format
        [
          ...characters.map(char => ({
            type: "character" as const,
            name: char.trim(),
            importance: 1.0
          })),
          ...events.map(event => ({
            type: "event" as const,
            name: event.trim(),
            importance: 1.0
          }))
        ],
        previousChapters
      );

      console.log("Received alternatives:", alternatives);

      // Transform alternatives into branches
      const newBranches = alternatives.map(alt => ({
        id: alt.id,
        chapterId: selectedChapter,
        summary: alt.summary,
        keyDifferences: alt.key_differences,
        continuityIssues: [],
        compatibilityScore: 0.85,
        preservedElements: alt.preserved_elements.map(name => ({
          type: characters.includes(name) ? 'character' as const : 'event' as const,
          name,
          importance: 1
        }))
      }));

      console.log("Transformed branches:", newBranches);
      setBranches(newBranches);
      
      toast({
        title: "Success",
        description: `Generated ${newBranches.length} alternative branches`,
      });
    } catch (error) {
      console.error('Error generating branches:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate branches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle branch selection
  const handleBranchSelect = async (branch: Branch) => {
    setSelectedBranch(branch);
    onBranchSelect?.(branch);
    try {
      const [preview, validation] = await Promise.all([
        previewBranch(storyId, branch.id),
        validateBranch(storyId, branch.id)
      ]);

      setBranchPreview({
        ...preview,
        ...validation,
        compatibility_score: validation.compatibility_score
      });

      toast({
        title: "Branch Preview Loaded",
        description: `Compatibility Score: ${(validation.compatibility_score * 100).toFixed(1)}%`,
      });
    } catch (error) {
      console.error('Error loading branch preview:', error);
      toast({
        title: "Error",
        description: "Failed to load branch preview",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Story Branching Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="flex gap-4 p-4 bg-gray-100">
          <div className="flex-1">
            <Label>Selected Chapter</Label>
            <div className="text-sm font-medium">
              {selectedChapter ? chapters.find(c => c.id === selectedChapter)?.title || 'Unknown Chapter' : 'No chapter selected'}
            </div>
          </div>

          <Input
            value={preservedCharacters}
            onChange={(e) => setPreservedCharacters(e.target.value)}
            placeholder="Preserved characters (comma-separated)"
            className="flex-1"
          />

          <Input
            value={preservedEvents}
            onChange={(e) => setPreservedEvents(e.target.value)}
            placeholder="Preserved events (comma-separated)"
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="preserve-ending"
              checked={preserveOriginalEnding}
              onCheckedChange={(checked) => setPreserveOriginalEnding(checked as boolean)}
            />
            <Label htmlFor="preserve-ending">Preserve original ending</Label>
          </div>

          <Button
            onClick={handleGenerateBranches}
            disabled={!selectedChapter || isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Branches'
            )}
          </Button>
        </div>

        <div className="flex flex-1">
          <div className="w-2/3 h-[600px] relative" ref={treeContainer}>
            <Tree
              data={treeData}
              renderCustomNodeElement={renderCustomNode}
              orientation="vertical"
              pathFunc="step"
              translate={{ x: 300, y: 50 }}
              separation={{ siblings: 2, nonSiblings: 2 }}
            />
          </div>

          <ScrollArea className="w-1/3 p-4 border-l">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Branch Preview</h3>
              {branches.length > 0 ? (
                <div className="space-y-6">
                  {branches.map((branch) => (
                    <Card key={branch.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => handleBranchSelect(branch)}>
                      <h4 className="font-semibold mb-2">{branch.summary}</h4>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium">Key Differences:</h5>
                          <ul className="list-disc pl-4 text-sm">
                            {branch.keyDifferences.map((diff, index) => (
                              <li key={index}>{diff}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Compatibility:</span>
                          <span className="text-sm font-bold text-green-600">
                            {(branch.compatibilityScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : selectedChapter ? (
                <p className="text-gray-500">Click "Generate Branches" to see alternative storylines</p>
              ) : (
                <p className="text-gray-500">Select a chapter to generate branches</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchingVisualizer; 