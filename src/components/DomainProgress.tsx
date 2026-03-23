import { cn } from "@/lib/utils";

export function DomainProgress({
  domainId,
  name,
  met,
  total,
  notMet,
  partial,
}: {
  domainId: string;
  name: string;
  met: number;
  total: number;
  notMet: number;
  partial: number;
}) {
  const percentage = total > 0 ? Math.round((met / total) * 100) : 0;

  return (
    <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition">
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-mono font-bold text-blue-400">{domainId}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium truncate">{name}</span>
          <div className="flex items-center gap-3 text-xs shrink-0">
            {met > 0 && <span className="text-emerald-400">{met} met</span>}
            {notMet > 0 && <span className="text-red-400">{notMet} gaps</span>}
            {partial > 0 && <span className="text-amber-400">{partial} partial</span>}
          </div>
        </div>
        <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              percentage >= 80
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : percentage >= 50
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : percentage > 0
                    ? "bg-gradient-to-r from-red-500 to-red-400"
                    : "bg-white/[0.05]"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-right">
        <span className={cn(
          "text-sm font-bold",
          percentage >= 80 ? "text-emerald-400" :
          percentage >= 50 ? "text-amber-400" :
          percentage > 0 ? "text-red-400" : "text-neutral-600"
        )}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
