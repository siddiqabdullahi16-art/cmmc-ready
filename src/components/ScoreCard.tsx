import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  const colorMap = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  const bgMap = {
    success: "bg-emerald-500/10",
    warning: "bg-amber-500/10",
    danger: "bg-red-500/10",
  };

  return (
    <Card className="hover:border-white/[0.12] transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-neutral-400 text-sm">{title}</p>
          {Icon && (
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgMap[color])}>
              <Icon className={cn("w-4 h-4", colorMap[color])} />
            </div>
          )}
        </div>
        <p className={cn("text-3xl font-bold animate-count", colorMap[color])}>{value}</p>
      </CardContent>
    </Card>
  );
}
