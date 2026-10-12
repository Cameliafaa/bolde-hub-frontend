// claimSuccess.jsx
import { CheckCircle } from "lucide-react";
import React from "react";

const ClaimSuccess = ({ onClose }) => {
  return (
    <div className="
      flex flex-col items-center justify-center
      text-center
      px-6 sm:px-10 lg:px-20
      py-10 sm:py-14 lg:py-20
    ">

      {/* ICON */}
      <div className="
        flex items-center justify-center
        w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28
        rounded-full
        bg-green-50
        mb-6
      ">
        <CheckCircle
          className="text-status-success"
          size={36}
        />
      </div>

      {/* TITLE */}
      <h2 className="
        text-lg sm:text-xl lg:text-2xl
        font-semibold
        text-brand-first
      ">
        Claim berhasil dikirim
      </h2>

      {/* DESCRIPTION */}
      <p className="
        mt-3
        text-xs sm:text-sm lg:text-base
        text-text-secondary
        max-w-sm sm:max-w-md lg:max-w-lg
      ">
        Tim kami akan segera memproses klaim Anda
      </p>

      {/* BUTTON */}
      <button
        onClick={onClose}
        className="
          mt-8
          w-full sm:w-auto
          px-6 py-3
          rounded-2xl
          bg-brand-first
          text-surface-background
          text-sm font-semibold
          hover:bg-brand-secondary
          transition
          shadow-md
        "
      >
        Close
      </button>
    </div>
  );
};

export default ClaimSuccess;
