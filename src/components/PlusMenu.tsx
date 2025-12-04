import { useState } from "react";
import { 
  Plus, Camera, Image, Paperclip, Wand2, Lightbulb, 
  Search, GraduationCap, FileText, Globe, Languages
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageGenerationModal } from "./ImageGenerationModal";
import { VoiceTranslationPanel } from "./VoiceTranslationPanel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PlusMenuProps {
  onCameraClick?: () => void;
  onPhotosClick?: () => void;
  onFilesClick?: () => void;
  onAction?: (action: string) => void;
  disabled?: boolean;
}

export const PlusMenu = ({
  onCameraClick,
  onPhotosClick,
  onFilesClick,
  onAction,
  disabled
}: PlusMenuProps) => {
  const [open, setOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);

  const handleAction = (action: string) => {
    setOpen(false);
    onAction?.(action);
  };

  const menuItems = [
    {
      icon: <Wand2 className="w-5 h-5" />,
      label: "Create image",
      description: "Visualize anything",
      action: "create_image",
      isImageGen: true
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      label: "Thinking",
      description: "Think longer for better answers",
      action: "thinking"
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Deep research",
      description: "Get a detailed report",
      action: "deep_research"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Web search",
      description: "Find real-time news and info",
      action: "web_search"
    },
    {
      icon: <Languages className="w-5 h-5" />,
      label: "Voice translation",
      description: "Translate between languages",
      action: "voice_translation",
      isTranslation: true
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: "Study and learn",
      description: "Learn a new concept",
      action: "study"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Add files",
      description: "Analyze or summarize",
      action: "add_files"
    }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          disabled={disabled}
        >
          <Plus size={22} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
        {/* Top Row - Camera, Photos, Files */}
        <div className="grid grid-cols-3 gap-3 mb-6 pt-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl border-border bg-card hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onCameraClick?.();
            }}
          >
            <Camera className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium">Camera</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl border-border bg-card hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onPhotosClick?.();
            }}
          >
            <Image className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium">Photos</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl border-border bg-card hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onFilesClick?.();
            }}
          >
            <Paperclip className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium">Files</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.isImageGen) {
              return (
                <ImageGenerationModal
                  key={item.action}
                  trigger={
                    <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  }
                />
              );
            }

            if (item.isTranslation) {
              return (
                <Dialog key={item.action} open={translationOpen} onOpenChange={setTranslationOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg p-0">
                    <VoiceTranslationPanel onClose={() => setTranslationOpen(false)} />
                  </DialogContent>
                </Dialog>
              );
            }

            return (
              <button
                key={item.action}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                onClick={() => handleAction(item.action)}
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
