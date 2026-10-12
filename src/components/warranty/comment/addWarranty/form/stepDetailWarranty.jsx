import React, { useState } from "react";
import DragDropImage from "../../../../common/dragImage";

const StepClaimDetail = ({
    data = {},
    onNext,
    onBack,
    submitting,
}) => {
    const [form, setForm] = useState({
        serial_number: data.serial_number || "",
        issue: data.issue || "",
        receipt: data.receipt || null,
        condition: data.condition || null,
        handover: data.handover || null,
    });

    const handleSubmit = () => {
        if (!form.serial_number || !form.issue) {
            alert("Lengkapi Nomor Seri dan Kendala");
            return;
        }

        onNext(form);
    };

    const handleConclusionChange = (e) => {
        setForm({ ...form, issue: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* NOMOR SERI */}
            <div className="flex flex-col">
                <label className="text-gray-500 font-semibold mb-2">Serial Number</label>
                <input
                    value={form.serial_number}
                    onChange={(e) =>
                        setForm({ ...form, serial_number: e.target.value })
                    } placeholder="Input Serial Number"
                    className="p-4 border rounded-xl border-gray-200"
                />
            </div>

            {/* KENDALA */}
            <div>
                <label className="font-semibold text-gray-600">
                    Problem
                </label>
                <textarea
                    value={form.issue}
                    onChange={handleConclusionChange}
                    placeholder="Input Objective Program"
                    rows={4}
                    className="w-full border rounded-lg p-3 text-[15px] border-gray-300"
                />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-600">
                        Purchasing Receipt
                    </label>
                    <DragDropImage
                        value={form.receipt}
                        onChange={(file) =>
                            setForm(prev => ({ ...prev, receipt: file }))
                        }
                    />                </div>

                <div className="flex flex-col">
                    <label className="font-semibold text-gray-600">
                        Completeness Product
                    </label>
                    <DragDropImage
                        value={form.condition}
                        onChange={(file) =>
                            setForm(prev => ({ ...prev, condition: file }))
                        }
                    />
                </div>

                {/* <div className="flex flex-col">
                    <label className="font-semibold text-gray-600">
                        Purchasing Receipt
                    </label>
                <DragDropImage
                    label="Foto Serah Terima Barang Pengganti"
                    onChange={(file) =>
                        setForm({ ...form, handover: file })
                    }
                />
                </div> */}
            </div>

            {/* ACTION */}
            <div className="flex justify-between pt-6 border-t">
                <button
                    onClick={onBack}
                    disabled={submitting}
                    className="
            border border-gray-300
            px-6 py-2 rounded-xl
            text-gray-700
          "
                >
                    Back
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="
            bg-[#002D62]
            text-white
            px-6 py-2
            rounded-xl
          "
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default StepClaimDetail;
