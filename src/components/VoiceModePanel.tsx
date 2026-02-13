import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Phone, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceModePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  lastAIResponse?: string;
  language: string;
  isAIResponding?: boolean;
}

export const VoiceModePanel = ({ 
  isOpen, onClose, onSendMessage, lastAIResponse, language, isAIResponding 
}: VoiceModePanelProps) => {
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const prevResponseRef = useRef(lastAIResponse);
  
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(language);
  const { isPlaying, speak, stop } = useTextToSpeech();

  // Auto-speak new AI responses
  useEffect(() => {
    if (isOpen && lastAIResponse && lastAIResponse !== prevResponseRef.current && autoSpeak && !isAIResponding) {
      prevResponseRef.current = lastAIResponse;
      setAiText(lastAIResponse);
      speak(lastAIResponse, language);
    }
  }, [lastAIResponse, isOpen, autoSpeak, isAIResponding]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setTranscript(text);
        onSendMessage(text);
      }
    } else {
      setTranscript("");
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, onSendMessage]);

  const handleStopSpeaking = () => {
    stop();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center"
      >
        {/* Close */}
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 rounded-full">
          <X size={20} />
        </Button>

        {/* Status text */}
        <div className="text-center mb-8">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
            {isRecording ? "Listening..." : isTranscribing ? "Processing..." : isPlaying ? "Speaking..." : isAIResponding ? "Thinking..." : "Tap to speak"}
          </p>
          <h2 className="text-sm font-semibold text-foreground max-w-md">
            {transcript || (isPlaying ? "Playing response..." : "Voice Mode")}
          </h2>
        </div>

        {/* Central animated sphere */}
        <div className="relative mb-12">
          <motion.div
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-colors",
              isRecording 
                ? "bg-destructive/20 border-2 border-destructive/40" 
                : isPlaying 
                  ? "bg-primary/20 border-2 border-primary/40" 
                  : "bg-muted border-2 border-border/50 hover:bg-muted/80"
            )}
            animate={isRecording ? { scale: [1, 1.08, 1] } : isPlaying ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            onClick={handleToggleRecording}
          >
            {isRecording ? (
              <MicOff size={40} className="text-destructive" />
            ) : isTranscribing ? (
              <Sparkles size={40} className="text-primary animate-pulse" />
            ) : (
              <Mic size={40} className="text-foreground" />
            )}
          </motion.div>

          {/* Ripple effect when recording */}
          {isRecording && (
            <>
              <motion.div className="absolute inset-0 rounded-full border-2 border-destructive/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <motion.div className="absolute inset-0 rounded-full border-2 border-destructive/20"
                animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
            </>
          )}
        </div>

        {/* AI Response preview */}
        {aiText && (
          <div className="max-w-md text-center px-4 mb-8">
            <p className="text-xs text-muted-foreground line-clamp-3">{aiText.substring(0, 200)}...</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn("rounded-full gap-2 text-xs", autoSpeak && "border-primary/30 bg-primary/5")}
          >
            {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Auto-speak {autoSpeak ? "on" : "off"}
          </Button>
          
          {isPlaying && (
            <Button variant="outline" size="sm" onClick={handleStopSpeaking} className="rounded-full gap-2 text-xs">
              <VolumeX size={14} /> Stop
            </Button>
          )}

          <Button variant="destructive" size="sm" onClick={onClose} className="rounded-full gap-2 text-xs">
            <Phone size={14} /> End
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
