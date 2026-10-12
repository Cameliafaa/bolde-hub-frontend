import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";
import DragDropImage from "../../common/dragImage";
import axios from "axios";

const AddStore = ({ open, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        store_code: "",
        store_name: "",
        description: "",
        province: null,
        channel: null,
        image: null,
    });

    const [provinces, setProvinces] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [importFile, setImportFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);

    // ===========================
    // IMPORT STORE EXCEL
    // ===========================
    const handleImportExcel = async () => {
        if (!importFile) {
            setError("Please upload Excel file first");
            return;
        }

        try {
            setImportLoading(true);
            const fd = new FormData();
            fd.append("file", importFile);

            await ApiRequest({
                url: "/import/stores",
                method: "POST",
                data: fd,
                isFormData: true,
            });

            onSuccess?.();
            resetForm();
            onClose();
        } catch (err) {
            console.error("IMPORT ERROR:", err);
            setError("Failed to import store data");
        } finally {
            setImportLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/templates/TEMPLATE UPLOAD STORE.xlsx";
        link.download = "TEMPLATE UPLOAD STORE.xlsx";
        link.click();
    };

    /* =========================
       FETCH MASTER DATA
    ========================= */
    useEffect(() => {
        if (!open) return;

        const fetchMaster = async () => {
            try {
                const [p, c] = await Promise.all([
                    ApiRequest({ url: `/provinces?limit=100`, method: "GET" }),
                    ApiRequest({ url: "/channels/all", method: "GET" }),
                ]);

                setProvinces(
                    (p?.data || []).map((x) => ({
                        id: x.province_id,
                        name: x.name,
                    }))
                );

                setChannels(
                    (c?.data || []).map((x) => ({
                        id: x.channel_id,
                        name: x.name,
                    }))
                );
            } catch (err) {
                console.error("FETCH MASTER ERROR:", err);
            }
        };

        fetchMaster();
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setError("");
    };

    const resetForm = () => {
        setForm({
            store_code: "",
            store_name: "",
            description: "",
            province: null,
            channel: null,
            image: null,
        });
        setError("");
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.store_code || !form.store_name) {
            setError("Store Code dan Store Name wajib diisi");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const fd = new FormData();
            fd.append("store_code", form.store_code);
            fd.append("store_name", form.store_name);
            fd.append("description", form.description);
            fd.append("province_id", form.province?.id || "");
            fd.append("channel_id", form.channel?.id || "");
            if (form.image) fd.append("image", form.image);

            await ApiRequest({
                url: "/stores",
                method: "POST",
                data: fd,
                isFormData: true,
            });

            onSuccess?.();
            resetForm();
            onClose();
        } catch (err) {
            console.error("ADD STORE ERROR:", err);
            setError("Gagal menambahkan Store");
        } finally {
            setLoading(false);
        }
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
                {/* CLOSE */}
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
                    <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
                        Add Store
                    </h2>

                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-8">
                    {error && (
                        <p className="text-red-600 text-sm font-medium mb-4">
                            {error}
                        </p>
                    )}

                    <div className="space-y-8">
                        {/* ================= IMPORT FROM EXCEL ================= */}
                        <div className="hidden sm:block">
                            <div className="col-span-2 mt-2">
                                <label className="text-[#6B7280] font-semibold">Import from Excel</label>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    className="w-full p-3 border rounded-xl bg-white"
                                />

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 mr-3"
                                    >
                                        Download Template
                                    </button>

                                    <button
                                        onClick={handleImportExcel}
                                        className="bg-[#002D62] text-white px-6 py-3 rounded-xl hover:bg-[#002D62]"
                                    >
                                        Import Excel
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* MOBILE */}
                        <div className="sm:hidden">
                            <details className="border rounded-xl p-4">
                                <summary className="font-semibold text-gray-700 cursor-pointer">
                                    Import from Excel
                                </summary>

                                <div className="mt-4 space-y-3">
                                    <input
                                        type="file"
                                        accept=".xlsx"
                                        onChange={(e) => setImportFile(e.target.files[0])}
                                        className="w-full p-3 border rounded-xl"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadTemplate}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                                        >
                                            Template
                                        </button>

                                        <button
                                            onClick={handleImportExcel}
                                            className="flex-1 bg-[#002D62] text-white py-2 rounded-xl"
                                        >
                                            Import
                                        </button>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* <p className="text-xs text-gray-400 mt-3">
                            * Import akan otomatis menambahkan data Store dari file Excel
                        </p> */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LEFT */}
                            <div className="space-y-5">
                                <CustomDropdown
                                    label="Province"
                                    placeholder="Select Province"
                                    options={provinces}
                                    searchable
                                    value={form.province}
                                    onChange={(opt) =>
                                        setForm((f) => ({ ...f, province: opt }))
                                    }
                                />

                                <CustomDropdown
                                    label="Channel"
                                    placeholder="Select Channel"
                                    options={channels}
                                    searchable
                                    value={form.channel}
                                    onChange={(opt) =>
                                        setForm((f) => ({ ...f, channel: opt }))
                                    }
                                />

                                <div>
                                    <label className="text-[#6B7280] font-semibold">
                                        Description
                                    </label>
                                    <textarea
                                        rows={6}
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Store utama wilayah Bandung"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#002D62] outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[#6B7280] font-semibold">
                                        Store Code
                                    </label>
                                    <input
                                        name="store_code"
                                        value={form.store_code}
                                        onChange={handleChange}
                                        placeholder="STR001"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#002D62] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[#6B7280] font-semibold">
                                        Store Name
                                    </label>
                                    <input
                                        name="store_name"
                                        value={form.store_name}
                                        onChange={handleChange}
                                        placeholder="Store Bandung"
                                        className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#002D62] outline-none"
                                    />
                                </div>

                                {/* IMAGE */}
                                <div>
                                    <label className="text-[#6B7280] font-semibold">
                                        Upload Image
                                    </label>
                                    <DragDropImage
                                        onChange={(file) =>
                                            setForm((f) => ({ ...f, image: file }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end mt-8 gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#002D62] text-white px-6 py-2 rounded-lg hover:opacity-90"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddStore;
