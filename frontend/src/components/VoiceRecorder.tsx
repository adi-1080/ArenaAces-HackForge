import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertSpeechToText } from '@/lib/services/speechService';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({ onTranscription, isProcessing = false }: VoiceRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/m4a' });
        try {
          setIsConverting(true);
          const text = await convertSpeechToText(audioBlob);
          onTranscription(text);
          toast({
            title: "Success",
            description: "Voice recording converted to text successfully!",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to convert speech to text",
            variant: "destructive",
          });
        } finally {
          setIsConverting(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Converting your speech to text...",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          disabled={isRecording || isConverting || isProcessing}
          variant="outline"
          size="icon"
          className="h-10 w-10"
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          disabled={!isRecording || isConverting || isProcessing}
          variant="destructive"
          size="icon"
          className="h-10 w-10"
        >
          <Square className="h-5 w-5" />
        </Button>
      )}
      {(isConverting || isProcessing) && (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      )}
    </div>
  );
} 