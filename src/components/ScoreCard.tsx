import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export function ScoreCard({
  title,
  value,
  color,
  icon: Icon,
}: {
  title: string;
  value: string;
  color: "success" | "warning" | "danger";
  icon?: LucideIcon;
}) {
  const config = {
    success: {
      text: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      topBorder: "from-emerald-500/60 to-emerald-400/40",
      glow: "shadow-emerald-500/10",
    },
    warning: {
      text: "text-amber-400",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      topBorder: "from-amber-500/60 to-amber-400/40",
      glow: "shadow-amber-500/10",
    },
    danger: {
      text: "text-red-400",
      iconBg: "bg-red-500/15",
      iconColor: "text-red-400",
      topBorder: "from-red-500/60 to-red-400/40",
      glow: "shadow-red-500/10",
    },
  }[color];

  return (
    <div className={cn(
      "relative card-lift p-5 overflow-hidden",
      "shadow-lg", config.glow
    )}>
      {/* Colored top stripe */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r", config.topBorder)} />

      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{title}</p>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", config.iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", config.iconColor)} style={{ width: "18px", height: "18px" }} />
          </div>
        )}
      </div>
      <p className={cn("text-3xl font-bold tracking-tight animate-count", config.text)}>{value}</p>
    </div>
  );
}
