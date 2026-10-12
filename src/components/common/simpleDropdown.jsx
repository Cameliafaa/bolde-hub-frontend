import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SimpleDropdown = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative inline-block">
            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="
    flex items-center gap-2
    px-5 py-2 rounded-full bg-white
    border border-gray-300 shadow-sm
    font-medium text-gray-800

    whitespace-nowrap     /* ⬅️ PAKSA 1 BARIS */
    w-auto min-w-max      /* ⬅️ AUTO WIDTH */
  "
            >
                <span className="whitespace-nowrap">
                    {selected?.label}
                </span>
                <ChevronDown size={16} />
            </button>

            {open && (
                <div className="
absolute z-50 mt-2
            min-w-full max-w-[260px]
            bg-white border border-gray-200
            rounded-xl shadow-lg overflow-hidden        ">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`
                px-4 py-2 cursor-pointer text-sm
                hover:bg-gray-100
                ${opt.value === value ? "bg-[#EAF1FF] text-[#002D62] font-semibold" : ""}
              `}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimpleDropdown;
