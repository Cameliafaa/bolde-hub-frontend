import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const DropdownEmployee = ({ label, value, onChange, options = [], placeholder }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedName = options.find((opt) => opt.id === value)?.name || "";

  return (
    <div className="flex flex-col space-y-2 relative" ref={dropdownRef}>
      {label && <label className="text-[#6B7280] font-semibold">{label}</label>}

      <div
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex justify-between items-center cursor-pointer"
      >
        <span>
          {selectedName || <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-xl z-50 max-h-[200px] overflow-auto animate-fade-in">
          {options.map((opt) => (
            <div
              key={opt.id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                value === opt.id ? "bg-[#EAF1FF] text-[#002D62]" : ""
              }`}
              onClick={() => {
                onChange(opt.id); // ⬅️ return ID only
                setOpen(false);
              }}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DropdownEmployee;
