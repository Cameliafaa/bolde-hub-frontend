import React from "react";

const SummaryCards = ({ summary }) => {
  const items = [
    { label: "Total Report", value: summary.totalTask },
    { label: "Manual Report", value: summary.manualReport },
    { label: "Auto Report", value: summary.autoReport },
    // { label: "Done", value: summary.done },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-5 bg-white border shadow-sm rounded-2xl border-surface-border"
        >
          <p className="text-sm text-text-light">{item.label}</p>
          <h2 className="mt-2 text-3xl font-extrabold text-text-primary">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
