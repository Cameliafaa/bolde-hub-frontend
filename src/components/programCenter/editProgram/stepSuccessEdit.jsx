import React from "react";
import IconWaiting from "../../../assets/images/icons/icon-waiting.png";

const StepProgramSuccessEdit = ({ onClose }) => {
  return (
    <div className="text-center animate-fadeIn">
      {/* HEADER */}
      <h2 className="text-[20px] font-semibold text-[#001A40] mb-10">
        Program berhasil diperbarui
      </h2>

      {/* ICON */}
      <div className="flex justify-center mb-6">
        <img
          src={IconWaiting}
          alt="Success"
          className="w-14 h-14 opacity-80"
        />
      </div>

      {/* TEXT */}
      <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
        Program telah berhasil diperbarui dan dikirim ulang untuk proses
        persetujuan. Silakan menunggu persetujuan dari atasan sesuai alur
        approval.
      </p>

      {/* BUTTON */}
      <div className="flex justify-center mt-12">
        <button
          onClick={onClose}
          className="bg-[#002D62] hover:bg-[#001A40] text-white font-semibold px-10 py-3 rounded-xl shadow-md transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StepProgramSuccessEdit;
