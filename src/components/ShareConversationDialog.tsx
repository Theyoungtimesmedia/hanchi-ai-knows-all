import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversationTitle: string;
}

export const ShareConversationDialog = ({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
}: ShareConversationDialogProps) => {
  const [isPublic, setIsPublic] = useState(true);
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const expiresAt = expiresIn === "never" 
        ? null 
        : new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("shared_conversations")
        .insert({
          conversation_id: conversationId,
          is_public: isPublic,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/shared/${data.share_token}`;
      setShareLink(link);
      
      toast({
        title: "Share link generated",
        description: "Copy the link to share this conversation",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Conversation</DialogTitle>
          <DialogDescription>
            Share "{conversationTitle}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-toggle">Public access</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expires in</Label>
            <select
              id="expiry"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <option value="1">24 hours</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="never">Never</option>
            </select>
          </div>

          {!shareLink ? (
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
