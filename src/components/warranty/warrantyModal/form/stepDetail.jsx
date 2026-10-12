import React, { useEffect, useState } from "react";
import DragDropImage from "../../../common/dragImage";

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

    useEffect(() => {
        setForm({
            serial_number: data.serial_number || "",
            issue: data.issue || "",
            receipt: null,
            condition: null,
            handover: null,
        });
    }, [data]);


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
                <label className="text-text-secondary font-semibold mb-2">Serial Number</label>
                <input
                    value={form.serial_number}
                    onChange={(e) =>
                        setForm({ ...form, serial_number: e.target.value })
                    } placeholder="Input Serial Number"
                    className="p-4 border rounded-xl border-surface-border"
                />
            </div>

            {/* KENDALA */}
            <div>
                <label className="font-semibold text-text-secondary">
                    Problem
                </label>
                <textarea
                    value={form.issue}
                    onChange={handleConclusionChange}
                    placeholder="Input Objective Program"
                    rows={4}
                    className="w-full border rounded-lg p-3 text-[15px] border-surface-border"
                />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col">
                    <label className="font-semibold text-text-secondary">
                        Purchasing Receipt
                    </label>
                    <DragDropImage
                        value={form.receipt}
                        onChange={(file) =>
                            setForm(prev => ({ ...prev, receipt: file }))
                        }
                    />                </div>

                <div className="flex flex-col">
                    <label className="font-semibold text-text-secondary">
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
            border border-text-light
            px-6 py-2 rounded-xl
            text-text-primary
          "
                >
                    Back
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="
            bg-brand-first
            text-surface-background
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
