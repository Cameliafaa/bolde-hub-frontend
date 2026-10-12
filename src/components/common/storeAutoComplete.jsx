import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const StoreDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Cari store...",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-2 relative" ref={ref}>
      {label && <label className="text-gray-500 font-semibold">{label}</label>}

      {/* INPUT UTAMA */}
      <div
        className="border rounded-2xl px-4 py-3 flex items-center gap-2 cursor-text"
        onClick={() => setOpen(true)}
      >
        <input
          value={open ? search : value?.name || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 outline-none"
        />
        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
          {filtered.length ? (
            filtered.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt);
                  setSearch("");
                  setOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">
              Store tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreDropdown;
