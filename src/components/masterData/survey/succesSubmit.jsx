import React from "react";
import { CheckCircle } from "lucide-react";

const SurveySuccessModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
      />


      {/* Container */}
      <div className="
        absolute inset-x-0 bottom-0
        sm:inset-0 sm:flex sm:items-center sm:justify-center
      ">
        <div
          className="
            relative
            bg-white
            w-full
            h-auto
            sm:max-w-md

            rounded-t-3xl sm:rounded-2xl
            shadow-2xl

            p-6 sm:p-8
            text-center

            animate-slideUp
          "
        >

          {/* Drag Handle (Mobile Only) */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>



          <div className="flex flex-col items-center">
            <CheckCircle size={56} className="text-green-500 mb-4 sm:mb-5" />

            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-[#001A40]">
              Survey berhasil dikirim
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Terima kasih atas partisipasi Anda
            </p>

            <button
              onClick={onClose}
              className="
                w-full
                sm:w-auto
                bg-[#002D62]
                text-white
                px-6 py-3
                rounded-xl
                font-medium
                hover:opacity-90
                transition
              "
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveySuccessModal;
