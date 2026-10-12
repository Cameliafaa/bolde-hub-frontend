import React from "react";

const SpvReportSummaryCards = ({ submissions = [], onCardClick }) => {
  const totalSubmission = submissions.length;

  const approved = submissions.filter(
    (item) => String(item.status).toLowerCase() === "approved",
  ).length;

  const rejected = submissions.filter(
    (item) => String(item.status).toLowerCase() === "rejected",
  ).length;

  const waiting = submissions.filter(
    (item) => String(item.status).toLowerCase() === "submitted",
  ).length;

  const cards = [
    { title: "Total Report", count: totalSubmission, type: "all" },
    { title: "Approved", count: approved, type: "approved" },
    { title: "Rejected", count: rejected, type: "rejected" },
    { title: "Waiting Approval", count: waiting, type: "waiting" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.type}
          onClick={() => onCardClick?.(card.type)}
          className="p-5 text-left transition bg-white border shadow-sm rounded-2xl hover:shadow-md"
        >
          <p className="text-sm font-medium text-text-light">{card.title}</p>
          <h3 className="mt-3 text-3xl font-bold text-brand-first">
            {card.count}
          </h3>
        </button>
      ))}
    </div>
  );
};

export default SpvReportSummaryCards;
