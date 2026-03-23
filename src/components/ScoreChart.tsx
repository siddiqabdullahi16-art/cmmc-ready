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
    { name: "Met", value: met, color: "#22c55e" },
    { name: "Partial", value: partial, color: "#eab308" },
    { name: "Not Met", value: notMet, color: "#ef4444" },
    { name: "Not Assessed", value: notAssessed, color: "#262626" },
  ].filter((d) => d.value > 0);

  // If nothing assessed yet, show empty state
  if (met === 0 && notMet === 0 && partial === 0) {
    data.length = 0;
    data.push({ name: "Not Started", value: 1, color: "#1a1a1a" });
  }

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{score}%</span>
        <span className="text-xs text-neutral-500">Ready</span>
      </div>
    </div>
  );
}
