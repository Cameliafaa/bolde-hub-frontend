import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangeFilter = ({ onApply, onReset }) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  return (
    <div
      className="
        relative
        flex flex-col
        sm:flex-row
        sm:flex-wrap
        items-stretch
        sm:items-center
        gap-3
        w-full
      "
    >
      {/* INPUT */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center justify-between
          gap-3
          border
          rounded-2xl
          px-4 py-2
          cursor-pointer
          bg-surface-border
          w-full
          sm:w-auto
          min-w-[260px]
        "
      >
        <span className="text-sm truncate">
          {range[0].startDate
            ? format(range[0].startDate, "dd/MM/yyyy")
            : "Start date"}
        </span>

        <span className="text-text-secondary shrink-0">to</span>

        <span className="text-sm truncate">
          {range[0].endDate
            ? format(range[0].endDate, "dd/MM/yyyy")
            : "End date"}
        </span>
      </div>

      {/* PICKER */}
      {open && (
        isMobile ? (
          // ✅ MOBILE: FIXED BOTTOM SHEET (nggak akan kepotong)
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40">
            <div className="w-full max-w-md bg-white rounded-t-3xl p-4 pb-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">Select Date Range</p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 font-semibold"
                >
                  Close
                </button>
              </div>

              <DateRange
                ranges={range}
                onChange={(item) => setRange([item.selection])}
                months={1}
                direction="vertical"
                showDateDisplay={false}
                rangeColors={["#002D62"]}
                locale={id}
              />
            </div>
          </div>
        ) : (
          // ✅ DESKTOP/TABLET: DROPDOWN NORMAL
          <div
            className="
    absolute
    top-full
    left-0
    lg:left-auto
    lg:right-0
    mt-2
    z-50
    bg-white
    shadow-2xl
    rounded-2xl
    overflow-auto
    max-w-[95vw]
  "
          >
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              months={2}
              direction="horizontal"
              showDateDisplay={false}
              rangeColors={["#002D62"]}
              locale={id}
            />
          </div>
        )
      )}
      {/* APPLY */}
      <button
        onClick={() => {
          onApply?.({
            startDate: range[0].startDate
              ? format(range[0].startDate, "yyyy-MM-dd")
              : "",
            endDate: range[0].endDate
              ? format(range[0].endDate, "yyyy-MM-dd")
              : "",
          });
          setOpen(false);
        }}
        className="
          w-full
          sm:w-auto
          px-6 py-2
          bg-brand-first
          text-white
          text-sm
          font-semibold
          rounded-xl
          hover:bg-brand-first
        "
      >
        Filter
      </button>

      {/* RESET */}
      <button
        onClick={() => {
          setRange([{ startDate: null, endDate: null, key: "selection" }]);
          onReset?.();
        }}
        className="
          w-full
          sm:w-auto
          px-5 py-2
          border
          text-sm
          font-semibold
          rounded-xl
          hover:bg-text-light
        "
      >
        Reset
      </button>
    </div>
  );
};

export default DateRangeFilter;

