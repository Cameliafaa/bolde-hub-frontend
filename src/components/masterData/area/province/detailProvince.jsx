import React from "react";
import { X } from "lucide-react";

const DetailProvinceModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div
        className="
    bg-white
    w-full
    sm:max-w-lg

    rounded-t-3xl sm:rounded-2xl
    shadow-xl
    relative

    p-6 sm:p-8

    max-h-[95vh]
    overflow-y-auto

    animate-slideUpMobile
    sm:animate-none
  "
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* HEADER (AVATAR STYLE) */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
            {data.name?.[0]}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {data.name}
            </h2>
            <p className="text-gray-500 text-sm">
              Province
            </p>
            <p className="text-gray-600 font-medium mt-1">
              {data.area?.name || "-"}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 overflow-y-auto">

          {/* LEFT CARD */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Province Information
            </h3>

            <div className="bg-gray-50 rounded-xl border p-4 space-y-2">
              <Row label="Province Code" value={data.province_code} />
              <Row label="Province Name" value={data.name} />
              <Row label="Area" value={data.area?.name} />
              <Row label="Allocation Percent" value={`${data.allocation_percent || 0}%`} />            </div>
          </div>

          {/* RIGHT CARD */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Metadata
            </h3>

            <div className="bg-gray-50 rounded-xl border p-4 space-y-2">
              <Row label="Created At" value={data.created_at?.split("T")[0]} />
              <Row label="Updated At" value={data.updated_at?.split("T")[0]} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailProvinceModal;

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-gray-200 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">
      {value || "-"}
    </span>
  </div>
);
