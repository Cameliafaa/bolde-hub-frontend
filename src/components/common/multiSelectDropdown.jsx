import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

const MultiSelectDropdown = ({
  label,
  values = [],
  onChange,
  options = [],
  disabled = false,
  placeholder = "Select",
  searchable = false,
  autoAll = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef(null);

  /* =========================
     CLICK OUTSIDE
  ========================= */
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc);

    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* =========================
     RESET SEARCH
  ========================= */
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  /* =========================
     NORMALIZE ID
  ========================= */
  const normalizeId = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "object") {
      const id =
        value.id ??
        value.channel_id ??
        value.area_id ??
        value.province_id ??
        value.store_id ??
        value.value ??
        null;

      return id === null ? null : String(id);
    }

    return null;
  };

  /* =========================
     NORMALIZED VALUES

     Cari value existing ke options
     supaya selalu dapat {id,name}
  ========================= */
  const normalizedValues = useMemo(() => {
    if (!Array.isArray(values)) {
      return [];
    }

    return values
      .map((value) => {
        const id = normalizeId(value);

        if (id === null) {
          return null;
        }

        const option = options.find((opt) => String(opt.id) === id);

        /*
         Kalau ketemu di master,
         selalu gunakan data master.
        */
        if (option) {
          return option;
        }

        /*
         Kalau belum ketemu tapi value
         sudah punya id + name,
         tetap tampilkan.
        */
        if (typeof value === "object" && value.name) {
          return {
            ...value,
            id:
              value.id ??
              value.channel_id ??
              value.area_id ??
              value.province_id ??
              value.store_id,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [values, options]);

  /* =========================
     SEARCH
  ========================= */
  const filteredOptions = searchable
    ? options.filter((option) =>
        String(option.name || "")
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : options;

  /* =========================
     CHECK SELECTED
  ========================= */
  const isSelected = (option) =>
    normalizedValues.some((value) => String(value.id) === String(option.id));

  /* =========================
     TOGGLE
  ========================= */
  const toggle = (option) => {
    if (disabled) return;

    const exists = normalizedValues.some(
      (value) => String(value.id) === String(option.id),
    );

    if (exists) {
      onChange(
        normalizedValues.filter(
          (value) => String(value.id) !== String(option.id),
        ),
      );

      return;
    }

    onChange([...normalizedValues, option]);
  };

  /* =========================
     REMOVE
  ========================= */
  const removeItem = (id) => {
    if (disabled) return;

    onChange(
      normalizedValues.filter((value) => String(value.id) !== String(id)),
    );
  };

  /* =========================
     ALL SELECTED
  ========================= */
  const allSelected =
    !autoAll &&
    options.length > 0 &&
    normalizedValues.length === options.length;

  /* =========================
     ALL LABEL
  ========================= */
  const lowerLabel = label?.toLowerCase() || "";

  const allLabel = lowerLabel.includes("area")
    ? "All Area"
    : lowerLabel.includes("channel")
      ? "All Channel"
      : lowerLabel.includes("province")
        ? "All Province"
        : lowerLabel.includes("store")
          ? "All Store"
          : "All Selected";

  return (
    <div className="relative flex flex-col space-y-2" ref={ref}>
      {label && (
        <label className="font-semibold text-text-secondary">{label}</label>
      )}

      {/* =========================
          INPUT
      ========================= */}
      <div
        onClick={() => {
          if (disabled) return;

          setOpen((prev) => !prev);
        }}
        className={`
          relative
          w-full
          border
          border-surface-border
          rounded-2xl
          shadow-sm
          p-4
          font-medium
          flex
          justify-between
          items-center
          transition

          ${
            disabled
              ? "bg-surface-border text-text-secondary cursor-not-allowed"
              : "bg-surface-background text-text-primary cursor-pointer"
          }
        `}
      >
        {/* EMPTY */}
        {normalizedValues.length === 0 && (
          <span className="text-text-secondary">{placeholder}</span>
        )}

        {/* ALL */}
        {allSelected && (
          <span className="px-4 py-1 text-sm font-medium rounded-full bg-surface-border">
            {allLabel}
          </span>
        )}

        {/* SELECTED ITEMS */}
        {!allSelected && normalizedValues.length > 0 && (
          <div className="flex max-w-full gap-2 pr-6 overflow-x-auto flex-nowrap scrollbar-hide">
            {normalizedValues.map((value) => (
              <span
                key={value.id}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-text-light whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {value.name}

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      removeItem(value.id);
                    }}
                    className="hover:text-status-danger"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        <ChevronDown
          size={18}
          className={`ml-auto ${
            disabled ? "text-text-light" : "text-text-secondary"
          }`}
        />
      </div>

      {/* =========================
          DROPDOWN
      ========================= */}
      {open && !disabled && (
        <div className="absolute left-0 w-full mt-1 overflow-auto border shadow-xl top-full border-surface-border rounded-xl bg-surface-background z-[9999] max-h-64 animate-fade-in">
          {/* SEARCH */}
          {searchable && (
            <div className="p-2 border-b">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              />
            </div>
          )}

          {/* SELECT ALL */}
          <div
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-text-light"
            onClick={() => {
              if (allSelected) {
                onChange([]);
              } else {
                onChange([...options]);
              }
            }}
          >
            <div
              className={`
                w-4
                h-4
                rounded
                border

                ${
                  allSelected
                    ? "bg-brand-first border-brand-first"
                    : "border-text-light"
                }
              `}
            />

            <span className="text-sm font-medium">Select All</span>
          </div>

          <div className="h-px my-1 bg-text-light" />

          {/* OPTIONS */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const checked = isSelected(option);

              return (
                <div
                  key={option.id}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-text-light"
                  onClick={() => toggle(option)}
                >
                  <span>{option.name}</span>

                  {checked && <Check size={16} className="text-brand-first" />}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-center text-text-secondary">
              No data found
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
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

export default MultiSelectDropdown;
