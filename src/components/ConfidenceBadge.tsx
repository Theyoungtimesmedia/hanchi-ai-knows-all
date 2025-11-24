import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  confidence: number; // 0-100
}

export const ConfidenceBadge = ({ confidence }: ConfidenceBadgeProps) => {
  const getConfidenceLevel = () => {
    if (confidence >= 80) return { label: "High", color: "bg-green-500/10 text-green-700 dark:text-green-400", icon: CheckCircle };
    if (confidence >= 50) return { label: "Medium", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", icon: Info };
    return { label: "Low", color: "bg-red-500/10 text-red-700 dark:text-red-400", icon: AlertCircle };
  };

  const { label, color, icon: Icon } = getConfidenceLevel();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${color} border-0`}>
            <Icon className="w-3 h-3" />
            <span className="text-xs">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Confidence: {confidence}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {confidence >= 80 && "This answer is well-supported by sources"}
            {confidence >= 50 && confidence < 80 && "This answer has moderate support"}
            {confidence < 50 && "This answer may need verification"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};