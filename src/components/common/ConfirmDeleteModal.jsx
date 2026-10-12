import React from "react";

const ConfirmDeleteModal = ({ open, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 px-4">
      <div
        className="
          bg-surface-border
          rounded-2xl
          shadow-lg
          text-center
          w-full

          max-w-xs        /* HP */
          sm:max-w-md     /* tablet & desktop */

          p-5             /* HP */
          sm:p-8          /* tablet & desktop */
        "
      >
        <h3
          className="
            text-status-warning
            font-semibold
            mb-3

            text-base      /* HP */
            sm:text-lg     /* tablet+ */
          "
        >
          NOTICE</h3>
        <p
          className="
            text-text-primary
            mb-6

            text-sm        /* HP */
            sm:text-base   /* tablet+ */
          "
        >
          Do you want to delete this data?</p>
        <div
          className="
            flex
            flex-col       /* HP: stack */
            sm:flex-row    /* tablet+: sejajar */
            justify-center
            gap-3
            sm:gap-4
          "
        >
          <button
            onClick={onCancel}
            className="
              border border-text-secondary
              rounded-lg
              text-text-primary

              px-4 py-2
              text-sm

              w-full        /* HP */
              sm:w-auto
            "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="
              bg-brand-first
              text-surface-border
              rounded-lg
              hover:opacity-90

              px-4 py-2
              text-sm

              w-full        /* HP */
              sm:w-auto
            "          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
