import React from "react";

const StatsCard = ({ title, value, bgColor, iconBg, icon, onClickViewMore }) => {
  return (
    <div
      className={`
        w-full
        min-h-[64px] sm:min-h-[72px]
        px-3 sm:px-4
        py-2
        flex items-center justify-between
        ${bgColor}
        rounded-xl
      `}
      style={{ borderRadius: "12px" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <img
            src={icon}
            alt="icon"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
          />
        </div>


        <div className="leading-tight">
          <p className="text-[11px] sm:text-xs font-medium text-gray-600">
            {title}
          </p>
          <p className="text-base sm:text-lg font-bold text-gray-800">
            {value}
          </p>
        </div>
      </div>

      <button
        onClick={onClickViewMore}
        className="
          text-[10px] sm:text-xs
          text-gray-600 underline
          hover:text-gray-800
          whitespace-nowrap
        "      >
        View More
      </button>
    </div>
  );
};

export default StatsCard;
