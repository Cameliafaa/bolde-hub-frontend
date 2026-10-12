import React from "react";

const Pagination = ({ current, total, onChange }) => {
  const generatePages = () => {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 2) return [1, 2, 3, "...", total];
    if (current >= total - 1) return [1, "...", total - 2, total - 1, total];

    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const pages = generatePages();

  return (
    <div className="mt-6 w-full">

      {/* ================= MOBILE ================= */}
      <div className="flex sm:hidden items-center justify-between">

        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="
            px-3 py-1 text-sm rounded-lg
            border border-surface-border
            text-brand-first
            disabled:text-text-light
            disabled:cursor-not-allowed
          "
        >
          Prev
        </button>

        <span className="text-sm font-medium text-text-primary">
          {current} / {total}
        </span>

        <button
          disabled={current === total}
          onClick={() => onChange(current + 1)}
          className="
            px-3 py-1 text-sm rounded-lg
            border border-surface-border
            text-brand-first
            disabled:text-text-light
            disabled:cursor-not-allowed
          "
        >
          Next
        </button>
      </div>


      {/* ================= TABLET & DESKTOP ================= */}
      <div className="hidden sm:flex items-center justify-end gap-2 select-none">

        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className={`
            px-3 py-1 text-sm rounded-lg transition
            ${current === 1
              ? "text-text-light cursor-not-allowed"
              : "text-brand-first hover:bg-surface-background"}
          `}
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={i}
              className="px-2 text-text-light text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onChange(p)}
              className={`
                px-4 py-1 rounded-lg border text-sm font-medium transition
                ${p === current
                  ? "bg-brand-first text-white border-brand-first"
                  : "bg-surface-card border-surface-border text-brand-first hover:bg-surface-background"}
              `}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={current === total}
          onClick={() => onChange(current + 1)}
          className={`
            px-3 py-1 text-sm rounded-lg transition
            ${current === total
              ? "text-text-light cursor-not-allowed"
              : "text-brand-first hover:bg-surface-background"}
          `}
        >
          Next
        </button>

      </div>
    </div>
  );
};

export default Pagination;
