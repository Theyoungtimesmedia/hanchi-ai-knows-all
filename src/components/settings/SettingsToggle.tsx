import { LucideIcon } from "lucide-react";

interface SettingsToggleProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({ 
  icon: Icon, 
  label, 
  description,
  checked, 
  onChange,
  disabled = false
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-muted-foreground" />
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full relative transition-all ${
          checked ? "bg-primary" : "bg-muted"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`w-5 h-5 bg-background rounded-full absolute top-0.5 shadow-sm transition-all ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
