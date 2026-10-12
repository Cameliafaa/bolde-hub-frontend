import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";

const CustomDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  searchable = false,
  searchOnField = false,
  clearable = false,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasValue =
    value && value.id !== undefined && value.id !== null && value.id !== "";

  const selectedOption = useMemo(() => {
    if (!hasValue) return null;
    return options.find((opt) => String(opt.id) === String(value.id)) || null;
  }, [hasValue, options, value]);

  const selectedName = selectedOption?.name || "";

  const filteredOptions = searchable
    ? options.filter((opt) =>
        String(opt.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : options;

  return (
    <div className="relative flex flex-col space-y-2" ref={dropdownRef}>
      {label && <label className="font-semibold text-gray-600">{label}</label>}

      <div className="relative flex items-center justify-between w-full p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
        {searchable && searchOnField ? (
          <input
            type="text"
            value={open ? search : selectedName}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            className="flex-1 text-sm bg-transparent outline-none"
          />
        ) : (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen((prev) => !prev);
            }}
            className="flex-1 text-sm cursor-pointer"
          >
            {selectedName || (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
        )}

        <div className="flex items-center gap-2">
          {clearable && selectedOption && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear?.();
                setOpen(false);
                setSearch("");
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="text-gray-400"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 w-full mt-1 overflow-hidden bg-white border border-gray-200 shadow-xl top-full z-[9999] rounded-xl">
          {searchable && !searchOnField && (
            <input
              autoFocus
              type="text"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 text-sm border-b outline-none"
            />
          )}

          <div className="overflow-y-auto max-h-[220px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${
                    String(selectedOption?.id) === String(opt.id)
                      ? "bg-gray-100 text-[#002D62]"
                      : "text-gray-700"
                  }`}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400">
                No data found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
