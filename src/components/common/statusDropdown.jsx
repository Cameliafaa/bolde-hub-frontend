import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const isActive = value === "active";

  const statusStyle = isActive
    ? "bg-green-100 text-green-700"
    : "bg-gray-200 text-gray-600";

  const optionStyle = (status) =>
    status === "active"
      ? "text-green-700 hover:bg-green-50"
      : "text-gray-600 hover:bg-gray-100";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2
          px-5 py-2
          rounded-full
          text-sm font-semibold
          transition-all duration-200
          shadow-sm
          ${statusStyle}
        `}
      >
        {value}
        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="
          absolute right-0 mt-2 w-32
          bg-white
          rounded-xl
          shadow-lg
          border
          overflow-hidden
          z-50
        ">
          {["active", "inactive"].map((status) => (
            <button
              key={status}
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm font-medium
                transition-colors
                ${optionStyle(status)}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;