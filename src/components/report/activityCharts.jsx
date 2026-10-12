import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ActivityChart = ({ chartData, rangeType, setRangeType }) => {
  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-first">
            Work Activity
          </h2>
          <p className="text-xs text-text-light">
            Aktivitas user berdasarkan log
          </p>
        </div>

        {/* Toggle */}
        <div className="flex p-1 rounded-full bg-surface-background">
          <button
            onClick={() => setRangeType("daily")}
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              rangeType === "daily"
                ? "bg-brand-first text-white"
                : "text-text-light"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setRangeType("weekly")}
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              rangeType === "weekly"
                ? "bg-brand-first text-white"
                : "text-text-light"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="count"
              stroke="#0B3A78"
              fill="#0B3A7820"
            />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#0B3A78"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
