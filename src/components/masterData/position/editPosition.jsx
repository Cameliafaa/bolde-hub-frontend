import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const PositionEditModal = ({ open, onClose, position, onSuccess }) => {
  const [form, setForm] = useState({ name: "", description: "", loading: false });

  useEffect(() => {
    if (position) {
      setForm({
        name: position.name || "",
        description: position.description || "",
      });
    }
  }, [position]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Position name is required");

    setForm((f) => ({ ...f, loading: true }));
    try {
      const res = await ApiRequest({
        url: `/positions/update/${position.id}`,
        method: "PUT",
        data: { name: form.name, description: form.description },
      });
      if (res.status === "success") {
        onSuccess();
        onClose();
      } else {
        alert(res.message || "Failed to update position");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating position");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
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
            Edit Position
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="text-[#6B7280] font-semibold">Position Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter position name"
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] focus:outline-none placeholder:text-gray-400"
            />
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

export default PositionEditModal;
