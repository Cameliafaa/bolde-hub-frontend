// src/components/development/addDevelopment/StepDevSuccess.jsx
import React from "react";
import { CheckCircle } from "lucide-react";

const StepDevEditSuccess = ({ developmentCreated, onClose }) => {
  const dev = developmentCreated;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
      />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div className="relative w-full h-auto p-6 text-center bg-white shadow-2xl sm:max-w-md rounded-t-3xl sm:rounded-2xl sm:p-8 animate-slideUp">
          {/* Drag Handle (Mobile Only) */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 bg-gray-300 rounded-full h-1.5" />
          </div>

          <div className="flex flex-col items-center">
            <CheckCircle className="mb-4 text-green-500 sm:mb-5" size={64} />
            <h2 className="mb-2 text-lg font-semibold sm:text-xl text-[#001A40]">
              Development Program Updated
            </h2>
            <p className="mb-6 text-sm text-gray-600 sm:text-base">
              Program training berhasil diperbaharui beserta questionsnya. Kamu
              bisa melihat detailnya di halaman Development Center.
            </p>

            {dev && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">ID:</span>{" "}
                  {dev.development_id}
                </p>
                <p>
                  <span className="font-semibold">Title:</span> {dev.title}
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-3 font-medium text-white transition sm:w-auto bg-[#002D62] rounded-xl hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDevEditSuccess;
