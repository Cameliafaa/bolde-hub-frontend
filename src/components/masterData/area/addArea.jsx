import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const AreaAddModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    area_code: "",
    description: "",
    loading: false,
  });

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Area name is required");

    setForm((f) => ({ ...f, loading: true }));
    setError("");

    try {
      const res = await ApiRequest({
        url: "/areas/create",
        method: "POST",
        data: {
          name: form.name,
          area_code: form.area_code,
          description: form.description,
        },
      });

      if (res.status === "success") {
        setForm({
          name: "",
          area_code: "",
          description: "",
          loading: false,
        });
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to add area");
      }
    } catch (e) {
      setError("Error connecting to server");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      area_code: "",
      description: "",
      loading: false,
    });
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
            Add Province
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
          {/* AREA CODE */}
          <div>
            <label className="text-gray-500 font-semibold">
              Area Code
            </label>
            <input
              type="text"
              value={form.area_code}
              onChange={(e) =>
                setForm((f) => ({ ...f, area_code: e.target.value }))
              }
              placeholder="NTB"
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-800"
            />
          </div>

          {/* AREA NAME */}
          <div>
            <label className="text-gray-500 font-semibold">
              Area Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Nusa Tenggara Barat"
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-800"
            />
          </div>

          {/* DESCRIPTION (opsional) */}
          {/* 
          <div>
            <label className="text-gray-500 font-semibold">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-800"
            />
          </div>
          */}
        </div>

        <div className="flex justify-end mt-6 gap-3 pt-4 border-t">
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

export default AreaAddModal;
