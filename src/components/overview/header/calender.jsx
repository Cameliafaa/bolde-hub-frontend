import React from "react";
import { CalendarDays } from "lucide-react";

const MarketingCalendarButton = ({ disabled = false }) => {
  return (
    <div className="relative group">
      <button
        type="button"
        disabled={disabled}
        className={`
          flex items-center justify-center gap-2
          bg-brand-first text-surface-card
          px-3 sm:px-4
          py-2
          rounded-lg shadow-sm
          transition
          ${disabled ? "cursor-not-allowed opacity-100" : "hover:opacity-90"}
        `}
      >
        <CalendarDays size={18} />

        {/* TEXT ONLY DESKTOP */}
        <span className="hidden sm:inline text-body-sm">
          Marketing Calendar
        </span>
      </button>

      {disabled && (
        <div
          className="
            absolute left-1/2 -translate-x-1/2 top-full mt-2
            px-3 py-1.5
            text-caption font-medium
            text-text-inverse
            bg-brand-primary
            rounded-md shadow-md
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            pointer-events-none whitespace-nowrap
            z-50
          "
        >
          Coming soon!
        </div>
      )}
    </div>
  );
};

export default MarketingCalendarButton;
