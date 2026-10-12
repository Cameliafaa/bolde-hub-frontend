import React, { useState } from "react";
import Bell from "../../../assets/images/icons/bell.png";

const Notification = ({ disabled = false }) => {
  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Program Smart Blender V8 segera berakhir" },
    { id: 2, text: "Ada 2 program baru ditambahkan" },
  ];

  return (
    <div className="relative group">
      {/* ICON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`
          relative p-2
          bg-surface
          border border-surface-border
          rounded-full shadow-sm
          transition
          ${disabled ? "cursor-not-allowed opacity-100" : "hover:bg-surface-hover"}
        `}
      >
        <img
          src={Bell}
          alt="notification"
          className="w-6 h-6 object-contain "
        />

        {/* Red Badge */}
        <span className="absolute top-1 right-1 w-2 h-2 bg-brand-danger rounded-full"></span>
      </button>

      {/* TOOLTIP */}
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

      {/* DROPDOWN */}
      {!disabled && open && (
        <div
          className="
            absolute right-0 mt-3 w-64
            bg-surface
            border border-surface-border
            rounded-xl shadow-lg
            z-20
          "
        >
          <div className="p-3 font-semibold text-body-sm border-b border-surface-border">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <p className="p-3 text-text-muted text-body-sm">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="
                  p-3 text-body-sm
                  border-b border-surface-border
                  hover:bg-surface-hover
                  cursor-pointer
                  transition
                "
              >
                {n.text}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
