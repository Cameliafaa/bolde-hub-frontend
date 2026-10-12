import React, { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

const SearchDropdown = ({
  value = null,
  onChange,
  options = [],
  placeholder = "Select",
  searchable = true,
  clearable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef(null);

  // =========================================================
  // CLICK OUTSIDE
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // SELECTED OPTION
  // =========================================================
  const selectedOption = useMemo(() => {
    if (
      !value ||
      value.id === undefined ||
      value.id === null ||
      value.id === ""
    ) {
      return null;
    }

    return (
      options.find((option) => String(option.id) === String(value.id)) || null
    );
  }, [value, options]);

  // =========================================================
  // FILTER OPTION
  // =========================================================
  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    const keyword = search.trim().toLowerCase();

    return options.filter((option) =>
      String(option.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [options, search, searchable]);

  const handleOpen = () => {
    setOpen(true);
    setSearch("");
  };

  const handleSelect = (option) => {
    onChange?.(option);

    setOpen(false);
    setSearch("");
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onChange?.(null);

    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* =====================================================
          FIELD
      ====================================================== */}
      <div
        onClick={() => {
          if (!open) {
            handleOpen();
          }
        }}
        className="flex items-center w-full min-w-0 px-4 transition border-2 shadow-sm h-[42px] bg-surface-card border-surface-border rounded-xl cursor-text focus-within:border-brand-first"
      >
        {/* ICON */}
        <Search size={18} className="mr-2 shrink-0 text-text-light" />

        {/* SEARCH FIELD */}
        {open && searchable ? (
          <input
            autoFocus
            type="text"
            value={search}
            placeholder={selectedOption?.name || placeholder}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className="flex-1 w-full min-w-0 text-sm bg-transparent outline-none text-text-primary placeholder:text-gray-400"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (open) {
                setOpen(false);
              } else {
                handleOpen();
              }
            }}
            className="flex-1 min-w-0 text-sm text-left truncate "
          >
            {selectedOption ? (
              <span className="text-text-primary">{selectedOption.name}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </button>
        )}

        {/* RIGHT ACTION */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {/* CLEAR */}
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center text-gray-400 transition hover:text-red-500"
            >
              <X size={15} />
            </button>
          )}

          {/* CHEVRON */}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (open) {
                setOpen(false);
                setSearch("");
              } else {
                handleOpen();
              }
            }}
            className="flex items-center justify-center text-gray-400 transition hover:text-brand-first"
          >
            <ChevronDown
              size={17}
              className={`
                transition-transform
                duration-200

                ${open ? "rotate-180" : ""}
              `}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          DROPDOWN MENU
      ====================================================== */}
      {open && (
        <div className="absolute left-0 w-full mt-1 overflow-hidden bg-white border border-gray-200 shadow-xl top-full z-[9999] rounded-xl">
          <div className="py-1 overflow-y-auto max-h-[220px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const active = String(selectedOption?.id) === String(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();

                      handleSelect(option);
                    }}
                    className={`
                        block
                        w-full

                        px-4
                        py-2.5

                        text-left
                        text-sm

                        transition

                        hover:bg-gray-100

                        ${
                          active
                            ? "bg-gray-100 text-brand-first font-medium"
                            : "text-gray-700"
                        }
                      `}
                  >
                    {option.name}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-sm text-center text-gray-400 ">
                No data found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
