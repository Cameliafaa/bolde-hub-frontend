import React from "react";
import { CheckCircle, X } from "lucide-react";

const ExtendSuccessModal = ({
  open,
  onClose,
  periodStart,
  periodEnd,
  onViewProgram,
}) => {
  if (!open) return null;

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d)
      ? "-"
      : d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10000] bg-black/40">
      <div className="relative w-full max-w-md p-6 bg-white shadow-xl pointer-events-auto rounded-2xl animate-fadeIn">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <CheckCircle size={56} className="text-green-600" />
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-center text-gray-800">
          Program Berhasil Di-Extend
        </h2>

        {/* PERIOD INFO */}
        <div className="p-4 mt-4 text-center border bg-gray-50 rounded-xl">
          <p className="mb-1 text-xs text-gray-500">Periode Program Baru</p>
          <p className="text-sm font-semibold text-gray-800">
            {periodStart && periodEnd
              ? `${formatDate(periodStart)} – ${formatDate(periodEnd)}`
              : "Periode sedang diproses..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExtendSuccessModal;
