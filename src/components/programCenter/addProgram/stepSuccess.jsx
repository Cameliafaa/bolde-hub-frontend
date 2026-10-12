import React from "react";
import IconWaiting from "../../../assets/images/icons/icon-waiting.png";

const APPROVALS = [
  { id: 1, name: "Airlangga Gusti", role: "Manager Marketing" },
  { id: 2, name: "Wilman Hilmani", role: "General Manager Marketing" },
  { id: 3, name: "Hary Chandra", role: "Direktur Marketing & Sales" },
];

const StepProgramSuccess = ({ onClose }) => {
  return (
    <div className="text-center animate-fadeIn">
      {/* Judul utama */}
      <h2 className="mb-10 font-semibold text-[20px] text-[#001A40]">
        Program berhasil ditambahkan sedang menunggu persetujuan
      </h2>

      {/* Riwayat Persetujuan */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-xl text-left">
          <h3 className="mb-6 text-sm font-semibold text-gray-700">
            Riwayat Persetujuan
          </h3>

          <div className="relative space-y-6">
            {APPROVALS.map((p, idx) => (
              <div key={p.id} className="relative flex items-start pl-6">
                {/* Garis vertikal */}
                {idx !== APPROVALS.length - 1 && (
                  <div className="absolute bottom-0 border-l border-gray-300 border-dashed left-[10px] top-6"></div>
                )}

                {/* Icon status */}
                <div className="absolute top-0 left-0">
                  <img
                    src={IconWaiting}
                    alt="Menunggu"
                    className="object-contain w-5 h-5"
                  />
                </div>

                {/* Info Persetujuan */}
                <div className="flex justify-between w-full">
                  <div>
                    <p className="text-sm font-semibold text-[#001A40]">
                      {p.name}
                    </p>
                    <p className="text-xs font-medium text-[#E6A400] mt-[2px]">
                      Menunggu
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tombol Close */}
      <div className="flex justify-center mt-12">
        <button
          onClick={onClose}
          className="px-10 py-3 font-semibold text-white transition shadow-md bg-[#002D62] hover:bg-[#001A40] rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StepProgramSuccess;
