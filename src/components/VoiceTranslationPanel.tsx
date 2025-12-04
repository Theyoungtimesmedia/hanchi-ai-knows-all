import { useState, useRef } from "react";
import { Mic, MicOff, Play, Pause, ArrowRight, Loader2, Upload, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useVoiceTranslation } from "@/hooks/useVoiceTranslation";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceTranslationPanelProps {
  onClose?: () => void;
}

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ha", label: "Hausa", flag: "🇳🇬" },
  { code: "pcm", label: "Pidgin", flag: "🇳🇬" },
];

export const VoiceTranslationPanel = ({ onClose }: VoiceTranslationPanelProps) => {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ha");
  const [transcribedText, setTranscribedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isHolding, setIsHolding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording(sourceLang);
  const { isTranslating, translateVoice } = useVoiceTranslation();
  const { isPlaying, isFetching, speak, stop } = useTextToSpeech();

  const handleRecordStart = async () => {
    setIsHolding(true);
    setTranscribedText("");
    setTranslatedText("");
    await startRecording();
  };

  const handleRecordEnd = async () => {
    setIsHolding(false);
    const text = await stopRecording();
    if (text) {
      setTranscribedText(text);
      // Auto-translate
      const translated = await translateVoice(text, sourceLang, targetLang);
      if (translated) {
        setTranslatedText(translated);
      }
    }
  };

  const handlePlayTranslation = async () => {
    if (isPlaying) {
      stop();
    } else if (translatedText) {
      await speak(translatedText, targetLang);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing audio...",
      description: "Transcribing your audio file",
    });

    // Convert to base64 and send for transcription
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      // Here you would call the transcription API
      // For now, show a placeholder
      setTranscribedText("Audio transcription coming soon...");
    };
    reader.readAsDataURL(file);
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setTranscribedText(translatedText);
    setTranslatedText(transcribedText);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-xl">👃</span> Voice Translation
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2 mb-6">
        <Select value={sourceLang} onValueChange={setSourceLang}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  {lang.flag} {lang.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={swapLanguages} className="shrink-0">
          <ArrowRight size={18} />
        </Button>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  {lang.flag} {lang.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* WhatsApp-style Voice Recording */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <button
            onMouseDown={handleRecordStart}
            onMouseUp={handleRecordEnd}
            onMouseLeave={() => isRecording && handleRecordEnd()}
            onTouchStart={handleRecordStart}
            onTouchEnd={handleRecordEnd}
            disabled={isTranscribing}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200",
              isRecording || isHolding
                ? "bg-destructive text-destructive-foreground scale-110 shadow-lg shadow-destructive/30"
                : "bg-primary text-primary-foreground hover:scale-105 shadow-lg shadow-primary/30",
              isTranscribing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isTranscribing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : isRecording ? (
              <MicOff size={32} />
            ) : (
              <Mic size={32} />
            )}
          </button>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-xs text-destructive font-medium">Recording</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          {isRecording ? "Release to stop" : "Hold to record"}
        </p>

        {/* Upload button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full"
          >
            <Upload size={16} className="mr-2" />
            Upload Audio
          </Button>
        </div>
      </div>

      {/* Transcription Result */}
      {transcribedText && (
        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              {languages.find(l => l.code === sourceLang)?.flag} Original
            </p>
            <p className="text-sm text-foreground">{transcribedText}</p>
          </div>

          {isTranslating && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Translating...</span>
            </div>
          )}

          {translatedText && (
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-primary flex items-center gap-1">
                  {languages.find(l => l.code === targetLang)?.flag} Translation
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayTranslation}
                  disabled={isFetching}
                  className="h-8 px-2"
                >
                  {isFetching ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={14} />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </Button>
              </div>
              <p className="text-sm text-foreground font-medium">{translatedText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
