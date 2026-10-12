import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";
import DragDropImage from "../../common/dragImage";

const EditStore = ({ open, onClose, onSuccess, data }) => {
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

    /* =========================
       PREFILL DATA
    ========================= */
    useEffect(() => {
        if (!open || !data || !provinces.length || !channels.length) return;

        const selectedProvince = provinces.find(
            (p) => p.id === data.province_id
        );

        const selectedChannel = channels.find(
            (c) => c.id === data.channel_id
        );

        setForm({
            store_code: data.store_code || "",
            store_name: data.store_name || "",
            description: data.description || "",
            province: selectedProvince || null,
            channel: selectedChannel || null,
            image: null,
        });
    }, [open, data, provinces, channels]);

    /* =========================
       FETCH MASTER DATA
    ========================= */
    useEffect(() => {
        if (!open) return;

        const fetchMaster = async () => {
            try {
                const [p, c] = await Promise.all([
                    ApiRequest({ url: "/provinces", method: "GET" }),
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

    const handleSubmit = async () => {
        if (!form.store_name || !form.province || !form.channel) {
            setError("Store Name, Province, dan Channel wajib diisi");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const fd = new FormData();
            fd.append("store_code", form.store_code);
            fd.append("store_name", form.store_name);
            fd.append("description", form.description || "");
            fd.append("province_id", String(form.province.id));
            fd.append("channel_id", String(form.channel.id));
            if (form.image) fd.append("image", form.image);

            await ApiRequest({
                url: `/stores/${data.store_id}`,
                method: "PUT",
                data: fd,
                isFormData: true,
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("EDIT STORE ERROR:", err);
            setError(err?.response?.data?.message || "Gagal update Store");
        } finally {
            setLoading(false);
        }
    };

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
                        Edit Store
                    </h2>

                    <button
                        onClick={onClose}
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
                                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#002D62] outline-none"
                                />
                            </div>

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

                <div className="flex justify-end mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#002D62] text-white px-6 py-2 rounded-lg hover:opacity-90"
                    >
                        {loading ? "Saving..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStore;
