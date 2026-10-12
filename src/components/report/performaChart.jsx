import React from "react";

const PerformanceSummaryChart = ({ onProgress = 0, onHold = 0, done = 0 }) => {
  const items = [
    { label: "On Progress", value: onProgress, color: "#3B82F6" },
    { label: "On Hold", value: onHold, color: "#F59E0B" },
    { label: "Done", value: done, color: "#22C55E" },
  ];

  const maxData = Math.max(...items.map((item) => item.value), 1);
  const roundedMax = Math.ceil(maxData / 5) * 5;
  const chartMax = Math.max(roundedMax, 5);

  const levels = 4;
  const yAxisValues = Array.from({ length: levels + 1 }, (_, i) =>
    Math.round(chartMax - (chartMax / levels) * i),
  );

  return (
    <div className="p-5 bg-white border shadow-sm rounded-2xl border-surface-border">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-brand-first">
          Performance Summary
        </h2>
        <p className="text-sm text-text-light">
          Ringkasan status task bulan ini
        </p>
      </div>

      <div className="relative px-4 py-4 overflow-hidden bg-white border h-[300px] rounded-2xl border-slate-200">
        <div className="grid h-full grid-cols-[56px_1fr] grid-rows-[1fr_44px]">
          <div className="relative col-span-2 row-span-1">
            {yAxisValues.map((value, index) => {
              const top = `${(index / levels) * 100}%`;

              return (
                <div key={value} className="absolute inset-x-0" style={{ top }}>
                  <div className="absolute left-0 text-sm -translate-y-1/2 w-[56px] text-slate-600">
                    {value}
                  </div>
                  <div className="absolute right-0 -translate-y-1/2 border-t border-dashed left-[56px] border-slate-200" />
                </div>
              );
            })}

            <div className="absolute top-0 bottom-0 border-l-2 left-[56px] border-slate-500" />

            <div className="absolute top-0 bottom-0 flex items-end justify-around left-[72px] right-4">
              {items.map((item) => {
                const barHeight = `${(item.value / chartMax) * 100}%`;

                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-end w-1/4 h-full"
                  >
                    <div
                      className="flex items-start justify-center transition-all duration-300 w-[88px] rounded-t-2xl"
                      style={{
                        height: barHeight,
                        backgroundColor: item.color,
                        minHeight: item.value > 0 ? "28px" : "0px",
                      }}
                    >
                      {item.value > 0 && (
                        <span className="pt-3 text-xl font-semibold text-white">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start justify-around col-start-2 row-start-2 pt-3 ml-4 border-t-2 border-slate-500">
            {items.map((item) => (
              <div
                key={item.label}
                className="w-1/4 text-base font-semibold text-center text-black"
              >
                {item.label.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSummaryChart;
