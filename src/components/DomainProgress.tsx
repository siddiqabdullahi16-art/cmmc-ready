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
  const isGood = percentage >= 80;
  const isOk = percentage >= 50;
  const hasActivity = met > 0 || notMet > 0 || partial > 0;

  return (
    <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group">
      {/* Domain ID pill */}
      <div className={cn(
        "w-11 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold font-mono",
        isGood && hasActivity ? "bg-emerald-500/15 text-emerald-400" :
        isOk && hasActivity ? "bg-amber-500/15 text-amber-400" :
        hasActivity ? "bg-red-500/15 text-red-400" :
        "bg-slate-800 text-slate-500"
      )}>
        {domainId}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200 truncate">{name}</span>
          <div className="flex items-center gap-2.5 text-xs shrink-0 ml-3">
            {met > 0 && <span className="text-emerald-400 font-medium">{met} met</span>}
            {notMet > 0 && <span className="text-red-400 font-medium">{notMet} gaps</span>}
            {partial > 0 && <span className="text-amber-400 font-medium">{partial} partial</span>}
            {!hasActivity && <span className="text-slate-600 text-xs">not started</span>}
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isGood && hasActivity ? "bg-gradient-to-r from-emerald-600 to-emerald-400" :
              isOk && hasActivity ? "bg-gradient-to-r from-amber-600 to-amber-400" :
              hasActivity ? "bg-gradient-to-r from-red-600 to-red-400" :
              "bg-slate-700"
            )}
            style={{ width: hasActivity ? `${Math.max(percentage, 2)}%` : "0%" }}
          />
        </div>
      </div>

      {/* Percentage */}
      <div className="w-10 text-right shrink-0">
        <span className={cn(
          "text-sm font-bold",
          isGood && hasActivity ? "text-emerald-400" :
          isOk && hasActivity ? "text-amber-400" :
          hasActivity ? "text-red-400" : "text-slate-600"
        )}>
          {hasActivity ? `${percentage}%` : "—"}
        </span>
      </div>
    </div>
  );
}
