import React from "react";
import { CheckCircle } from "lucide-react";

const StepDelegationSuccess = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[320px]">
      <CheckCircle size={64} className="mb-5 text-green-500" />

      <h2 className="mb-2 text-lg font-semibold text-[#001A40] sm:text-xl">
        Delegation berhasil dikirim
      </h2>

      <p className="mb-6 text-sm text-gray-600 sm:text-base">
        Employee berhasil didelegasikan
      </p>

      <button
        onClick={onClose}
        className="w-full px-6 py-3 font-medium text-white transition rounded-xl bg-[#002D62] hover:opacity-90 sm:w-auto"
      >
        OK
      </button>
    </div>
  );
};

export default StepDelegationSuccess;
