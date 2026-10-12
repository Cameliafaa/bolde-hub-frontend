import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const PositionAddModal = ({ open, onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: "", description: "", loading: false });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setError("Position name is required");
            return;
        }

        setForm((f) => ({ ...f, loading: true }));
        setError("");

        try {
            const res = await ApiRequest({
                url: "/positions/create",
                method: "POST",
                data: { name: form.name, description: form.description },
            });
            if (res.status === "success") {
                // reset form setelah sukses
                setForm({ name: "", description: "", loading: false });
                onSuccess();
                onClose();
            } else {
                setError(res.message || "Failed to add positions");
            }
        } catch (e) {
            const msg =
                e.message?.toLowerCase().includes("network")
                    ? "Tidak dapat terhubung ke server."
                    : e.message || "Terjadi kesalahan pada server.";
            setError(msg);
        } finally {
            setForm((f) => ({ ...f, loading: false }));
        }
    };

    const handleClose = () => {
        // reset isi form saat ditutup (baik klik X atau close dari luar)
        setForm({ name: "", description: "", loading: false });
        setError("");
        onClose();
    };

    if (!open) return null;

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
                <div
                    className="
    flex items-center justify-between
    mb-4
    sticky top-0
    bg-white
    z-20
    pb-3
    border-b
  "
                >
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        Add Position
                    </h2>

                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={22} />
                    </button>
                </div>

                {error && (
                    <p className="text-red-600 text-sm font-medium mb-3">
                        {error}
                    </p>
                )}

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-[#6B7280] font-semibold">Position Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter position name"
                            className={`w-full p-4 bg-white border ${error && !form.name.trim()
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-[#002D62]"
                                } rounded-2xl shadow-sm text-gray-800 font-medium focus:ring-2 focus:border-[#002D62] focus:outline-none placeholder:text-gray-400`} />
                    </div>
                    <div>
                        <label className="text-[#6B7280] font-semibold">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] focus:outline-none placeholder:text-gray-400"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={form.loading}
                        className="bg-[#002D62] text-white px-6 py-2 rounded-lg hover:opacity-90"
                    >
                        {form.loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PositionAddModal;
