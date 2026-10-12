import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const NewsEditModal = ({ open, onClose, news, onSuccess }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        loading: false,
    });
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(news?.image || null);


    useEffect(() => {
        if (news) {
            setForm({
                title: news.title,
                description: news.description,
                start_date: news.startDate?.split(" ")[0] || "",
                end_date: news.endDate?.split(" ")[0] || "",
                loading: false,
            });
        }
    }, [news]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return setError("Title is required");

        setForm((f) => ({ ...f, loading: true }));

        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("description", form.description);
            fd.append("start_date", form.start_date);
            fd.append("end_date", form.end_date);

            // Jika user pilih gambar baru → kirim
            if (imageFile) {
                fd.append("image", imageFile);
            }

            const res = await ApiRequest({
                url: `/calendars/update/${news.id}`,
                method: "PUT",
                data: fd,
                isFormData: true,
            });

            if (res.status === "success") {
                onSuccess();
                onClose();
            } else {
                setError("Failed to update calendar");
            }
        } catch (e) {
            setError("Update failed");
        } finally {
            setForm((f) => ({ ...f, loading: false }));
        }
    };

    const handleClose = () => {
        onClose();
        setError("");
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
                    <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
                        Edit News
                    </h2>

                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    {error && <p className="text-red-600 text-sm font-medium mb-3">{error}</p>}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col col-span-2 ">
                                <label className="text-[#6B7280] font-semibold">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter title"
                                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                />
                            </div>


                            <div>
                                <label className="text-[#6B7280] font-semibold">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-[#6B7280] font-semibold">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="text-[#6B7280] font-semibold">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={7}
                                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                />
                            </div>


                            <div>
                                <label className="text-[#6B7280] font-semibold">Image</label>

                                <div
                                    className="w-full h-48 border-2 border-dashed rounded-xl bg-[#F6F9FF] flex flex-col items-center justify-center cursor-pointer hover:bg-[#EEF3FF] transition relative mt-2"
                                    onClick={() => document.getElementById("calendarImageUploadAdd").click()}
                                >
                                    {!imagePreview ? (
                                        <p className="text-gray-600 font-medium">Upload image here</p>
                                    ) : (
                                        <>
                                            <img src={imagePreview} className="h-full object-contain rounded-lg" />
                                            <button
                                                className="absolute top-3 right-3 bg-white p-1 rounded-full shadow"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}

                                    <input
                                        id="calendarImageUploadAdd"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={form.loading}
                                className="bg-[#002D62] text-white px-6 py-2 rounded-lg hover:opacity-90"
                            >
                                {form.loading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsEditModal;
