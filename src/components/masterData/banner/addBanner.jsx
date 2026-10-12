import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import DragDropImage from "../../common/dragImage";

const AddBannerModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    loading: false,
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Banner name is required");
      return;
    }

    if (!form.image) {
      setError("Banner image is required");
      return;
    }

    setForm((f) => ({ ...f, loading: true }));
    setError("");

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("image", form.image);

      const res = await ApiRequest({
        url: "/banners/create",
        method: "POST",
        data: fd,
        isFormData: true,
      });

      if (res.status === "success") {
        onSuccess();
        handleClose();
      } else {
        setError(res.message || "Failed to add banner");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  const handleClose = () => {
    setForm({ name: "", description: "", image: null, loading: false });
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
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Add Banner
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium mb-3">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-600 font-semibold">Banner Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Enter banner name"
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          <div>
            <label className="text-gray-600 font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#002D62]"
            />
          </div>

          {/* 🔥 DRAG & DROP IMAGE */}
          <label className="text-gray-500 font-semibold">Image</label>
          <DragDropImage
            onChange={(file) =>
              setForm((f) => ({ ...f, image: file }))
            }
          />
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={form.loading}
            className="bg-[#002D62] text-white px-6 py-2 rounded-lg"
          >
            {form.loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBannerModal;
