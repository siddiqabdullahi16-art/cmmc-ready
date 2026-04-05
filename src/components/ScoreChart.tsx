"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ScoreChart({
  score,
  met,
  notMet,
  partial,
  notAssessed,
}: {
  score: number;
  met: number;
  notMet: number;
  partial: number;
  notAssessed: number;
}) {
  const data = [
    { name: "Met", value: met, color: "#10b981" },
    { name: "Partial", value: partial, color: "#f59e0b" },
    { name: "Not Met", value: notMet, color: "#ef4444" },
    { name: "Not Assessed", value: notAssessed, color: "#1e293b" },
  ].filter((d) => d.value > 0);

  if (met === 0 && notMet === 0 && partial === 0) {
    data.length = 0;
    data.push({ name: "Not Started", value: 1, color: "#1e293b" });
  }

  const scoreColor =
    score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : score === 0 ? "#475569" : "#ef4444";

  return (
    <div className="relative w-52 h-52 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={66}
            outerRadius={90}
            paddingAngle={data.length > 1 ? 2 : 0}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color: scoreColor }}>
          {score}%
        </span>
        <span className="text-xs text-slate-500 mt-0.5 font-medium">Readiness</span>
      </div>
    </div>
  );
}
