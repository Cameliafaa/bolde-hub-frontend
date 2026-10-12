import React from "react";
import { X } from "lucide-react";

const DetailAreaModal = ({ open, onClose, data }) => {
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

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-6">
                    {/* <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                        {data.name?.[0]}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {data.name}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Area
                        </p>
                        <p className="text-gray-600 font-medium mt-1">
                            {data.area_code || "-"}
                        </p>
                    </div> */}
                    <h2 className="text-xl font-semibold text-gray-800">
                        Detail Area
                    </h2>

                </div>

                {/* BODY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 overflow-y-auto">

                    {/* LEFT */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Area Information
                        </h3>

                        <div className="bg-gray-50 rounded-xl border p-4 space-y-2">
                            <Row label="Area Code" value={data.area_code} />
                            <Row label="Area Name" value={data.name} />
                            <Row label="Description" value={data.description} />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Provinces
                        </h3>

                        <div className="bg-gray-50 rounded-xl border p-4">
                            {data.provinces?.length ? (
                                <ul className="space-y-2 text-sm">
                                    {data.provinces.map((p) => (
                                        <li
                                            key={p.province_id}
                                            className="flex justify-between border-b pb-1"
                                        >
                                            <span className="text-gray-700">{p.name}</span>
                                            <span className="text-gray-400 text-xs">
                                                {p.province_code}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 italic text-sm">
                                    No province assigned
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DetailAreaModal;


const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">
            {value || "-"}
        </span>
    </div>
);