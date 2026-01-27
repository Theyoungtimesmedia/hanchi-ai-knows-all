import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, icon: Icon, children, className }: SettingsSectionProps) {
  return (
    <div className={cn("bg-card rounded-2xl p-5 shadow-sm border border-border", className)}>
      <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="text-primary" size={18} />
        {title}
      </h2>
      {children}
    </div>
  );
}
