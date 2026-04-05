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
      gradientText: "gradient-text-emerald",
      iconBg: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      iconBorder: "border-emerald-500/20",
      stripe: "from-emerald-400 via-emerald-500 to-transparent",
      glow: "group-hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]",
    },
    warning: {
      gradientText: "gradient-text-amber",
      iconBg: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
      iconBorder: "border-amber-500/20",
      stripe: "from-amber-400 via-amber-500 to-transparent",
      glow: "group-hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
    },
    danger: {
      gradientText: "gradient-text-red",
      iconBg: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      iconBorder: "border-red-500/20",
      stripe: "from-red-400 via-red-500 to-transparent",
      glow: "group-hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]",
    },
  }[color];

  return (
    <div className={cn("group relative glass-card p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5", config.glow)}>
      {/* Accent stripe on top-left */}
      <div className={cn("absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r", config.stripe)} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br border transition-all",
            config.iconBg, config.iconBorder
          )}>
            <Icon className={cn("w-4 h-4", config.iconColor)} />
          </div>
        )}
      </div>
      <p className={cn("text-[2.5rem] leading-none font-bold tracking-tight tabular-nums animate-count", config.gradientText)}>
        {value}
      </p>
    </div>
  );
}
